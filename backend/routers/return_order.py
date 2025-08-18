from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, List

from db.database import get_db
from fastapi import APIRouter, Body, Depends, HTTPException, status
from models.book import BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    ReturnOrder,
    ReturnOrderStatus,
)
from models.user import User, UserRole
from schemas.order import (
    UpdateReturnOrderStatusRequest,
)
from schemas.return_order import ClientBorrowsResponse, ReturnOrderRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.auth import get_staff_user, get_user_via_session
from utils.order import (
    validate_return_order_for_courier,
    validate_return_order_for_employee,
)
from utils.socket import (
    send_courier_return_order,
    send_updated_return_order,
)
from utils.wallet import add_to_wallet, pay_from_wallet
from crud.return_orders import (
    create_return_order_crud,
    get_client_borrows_books_crud,
)

return_order_router = APIRouter(
    prefix="/return-order",
    tags=["Return Order"],
)


@return_order_router.get("/client-borrows", response_model=List[ClientBorrowsResponse])
async def get_client_borrows(
    user: User = Depends(get_user_via_session), db: AsyncSession = Depends(get_db)
):
    client_borrows = await get_client_borrows_books_crud(user.id, db)
    return client_borrows


@return_order_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_return_order(
    return_return_order_data: ReturnOrderRequest,
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    retrun_order = await create_return_order_crud(user, return_return_order_data, db)
    return {
        "message": "Return order created successfully",
        "return_order_id": retrun_order.id,
    }


@return_order_router.patch(
    "/return-order-status",
    response_model=UpdateReturnOrderStatusRequest,
)
async def update_return_order_status(
    return_order_data: Annotated[UpdateReturnOrderStatusRequest, Body()],
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    try:
        query = (
            select(ReturnOrder)
            .where(ReturnOrder.id == return_order_data.id)
            .options(joinedload(ReturnOrder.user))
            .options(
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                )
            )
        )
        result = await db.execute(query)
        db_return_order = result.scalar_one_or_none()

        if not db_return_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Return Order with id {return_order_data.id} not found.",
            )

        if staff_user.role == UserRole.COURIER:
            validate_return_order_for_courier(
                return_order_data, db_return_order, staff_user
            )

        if staff_user.role == UserRole.EMPLOYEE:
            validate_return_order_for_employee(return_order_data, db_return_order)

        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY.value:
            db_return_order.courier_id = staff_user.id

        if (
            return_order_data.status == ReturnOrderStatus.DONE.value
            and return_order_data.borrow_order_books_details is not None
        ):
            for db_book in db_return_order.borrow_order_books_details:
                for new_book in return_order_data.borrow_order_books_details:
                    if db_book.id == new_book.id:
                        db_book.borrow_book_problem = new_book.borrow_book_problem
                        break

            amount_to_add: Decimal = Decimal(0)
            amount_to_withdraw: Decimal = Decimal(0)
            now_utc = datetime.now(timezone.utc)

            for book in db_return_order.borrow_order_books_details:
                book.actual_return_date = now_utc
                db_return_order.user.current_borrowed_books -= 1

                if book.expected_return_date is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Book with id {book.id} has not been picked up yet.",
                    )

                if book.borrow_book_problem == BorrowBookProblem.NORMAL.value:
                    if (
                        book.expected_return_date
                        and book.expected_return_date < now_utc
                    ):
                        days_overdue = (now_utc - book.expected_return_date).days
                        amount_to_withdraw += days_overdue * book.delay_fees_per_day
                    else:
                        amount_to_add += book.deposit_fees

                elif book.borrow_book_problem == BorrowBookProblem.LOST.value:
                    book_price_after_discount = book.original_book_price
                    if book.promo_code_discount:
                        book_price_after_discount -= book.promo_code_discount

                    amount_to_withdraw += book_price_after_discount - book.deposit_fees

            # This after for loop
            if amount_to_add > 0:
                await add_to_wallet(
                    db=db,
                    user=db_return_order.user,
                    amount=amount_to_add,
                    description=f"Deposit return for Return Order ID: {db_return_order.id}",
                    order_id=db_return_order.id,
                )
            if amount_to_withdraw > 0:
                await pay_from_wallet(
                    db=db,
                    user=db_return_order.user,
                    amount=amount_to_withdraw,
                    description=f"Penalty fees for Return Order ID: {db_return_order.id}",
                    order_id=db_return_order.id,
                    apply_negative_balance=True,
                )

        db_return_order.status = return_order_data.status
        await db.commit()
        await db.refresh(db_return_order)
        db_return_order.number_of_books = len(
            db_return_order.borrow_order_books_details
        )

        # TODO send notification to user
        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY.value:
            await send_updated_return_order(db_return_order, UserRole.COURIER)

        if return_order_data.status == ReturnOrderStatus.PICKED_UP.value:
            await send_courier_return_order(db_return_order)

        if return_order_data.status == ReturnOrderStatus.CHECKING.value:
            await send_updated_return_order(db_return_order, UserRole.EMPLOYEE)

        return db_return_order

    except Exception as e:
        # For any other unexpected error, rollback and raise a generic 500 error
        await db.rollback()
        raise e


@return_order_router.get(
    "/{return_order_id}",
    response_model=UpdateReturnOrderStatusRequest,
    status_code=status.HTTP_200_OK,
)
async def get_order_details(
    return_order_id: int,
    db: AsyncSession = Depends(get_db),
    staff_user: User = Depends(get_staff_user),
):
    conditions = [ReturnOrder.id == return_order_id]

    if staff_user.role == UserRole.COURIER:
        conditions.append(ReturnOrder.courier_id == staff_user.id)

    try:
        query = (
            select(ReturnOrder)
            .where(*conditions)
            .options(
                joinedload(ReturnOrder.user),
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                ),
            )
            .order_by(ReturnOrder.created_at.desc())
        )

        result = await db.execute(query)
        return_order = result.scalars().first()
        if not return_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {return_order_id} not found.",
            )

        return_order.number_of_books = len(return_order.borrow_order_books_details)
        return return_order

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise e
