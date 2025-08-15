from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, List

from crud.order import create_return_order_crud, get_borrowed_books_crud
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
    BorrowedBooksResponse,
    ReturnOrderRequest,
    UpdateReturnOrderStatusRequest,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.auth import get_staff_user, get_user_via_session
from utils.order import (
    validate_borrowed_books,
    validate_return_order_for_courier,
    validate_return_order_for_employee,
)
from utils.settings import get_settings
from utils.wallet import add_to_wallet, pay_from_wallet

return_order_router = APIRouter(
    prefix="/return-order",
    tags=["Return Order"],
)


@return_order_router.post("/")
async def create_return_order(
    return_return_order_data: ReturnOrderRequest,
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    borrowed_books = await get_borrowed_books_crud(user.id, db)
    db_borrowed_books_ids = [book.id for book in borrowed_books]

    validate_borrowed_books(return_return_order_data, db_borrowed_books_ids)

    settings = await get_settings(db)

    return_order = await create_return_order_crud(
        user.id, return_return_order_data, settings.delivery_fees, db
    )

    for book_id in return_return_order_data.borrowed_books_ids:
        for book in borrowed_books:
            if book.id == book_id:
                book.return_order = return_order
                break

    await db.commit()

    pass


@return_order_router.get("/borrowed-books", response_model=List[BorrowedBooksResponse])
async def get_borrowed_books(
    user: User = Depends(get_user_via_session), db: AsyncSession = Depends(get_db)
):
    borrowed_books = await get_borrowed_books_crud(user.id, db)
    return borrowed_books


@return_order_router.patch(
    "/return-order-status",
    response_model=UpdateReturnOrderStatusRequest,
)
async def update_return_order_status(
    return_order_data: Annotated[UpdateReturnOrderStatusRequest, Body()],
    db: AsyncSession = Depends(get_db),
    staff: User = Depends(get_staff_user),
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

        if staff.role == UserRole.COURIER:
            validate_return_order_for_courier(return_order_data, db_return_order, staff)

        if staff.role == UserRole.EMPLOYEE:
            validate_return_order_for_employee(
                return_order_data, db_return_order, staff
            )

        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY:
            db_return_order.courier_id = staff.id

        if (
            return_order_data.status == ReturnOrderStatus.DONE
            and return_order_data.borrow_order_books_details is not None
        ):
            # set new borrow_book_problem in db_return_order
            for db_book in db_return_order.borrow_order_books_details:
                for new_book in return_order_data.borrow_order_books_details:
                    if db_book.id == new_book.id:
                        db_book.borrow_book_problem = new_book.borrow_book_problem
                        break

            amount_to_add: Decimal = Decimal(0)
            amount_to_withdraw: Decimal = Decimal(0)
            now_utc = datetime.now(timezone.utc)

            for book in db_return_order.borrow_order_books_details:
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
                        amount_to_withdraw += (
                            now_utc - book.expected_return_date
                        ).days * book.delay_fees_per_day
                    else:
                        amount_to_add += book.deposit_fees
                elif book.borrow_book_problem == BorrowBookProblem.LOST.value:
                    if book.promo_code_discount is not None:
                        amount_to_withdraw += (
                            book.original_book_price
                            - book.promo_code_discount
                            - book.deposit_fees
                        )
                    else:
                        amount_to_withdraw += (
                            book.original_book_price - book.deposit_fees
                        )

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
                    description=f"Fees for Return Order ID: {db_return_order.id}",
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
    user: User = Depends(get_user_via_session),
):
    conditions = [ReturnOrder.id == return_order_id]

    if user.role == UserRole.CLIENT:
        conditions.append(ReturnOrder.user_id == user.id)
    elif user.role == UserRole.COURIER:
        conditions.append(ReturnOrder.courier_id == user.id)

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
