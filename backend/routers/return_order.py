from fastapi import APIRouter, Depends, Body, HTTPException, status

from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from typing import Annotated, List
from decimal import Decimal
from datetime import datetime, timezone

from db.database import get_db

from models.user import User, UserRole
from models.order import (
    ReturnOrder,
    ReturnOrderStatus,
    BorrowBookProblem,
    BorrowOrderBook,
)
from models.book import BookDetails

from crud.order import get_borrowed_books_crud, create_return_order_crud

from utils.auth import get_staff_user
from utils.auth import get_user
from utils.settings import get_settings
from utils.order import (
    validate_borrowed_books,
    Validate_return_order_for_courier,
    Validate_return_order_for_employee,
)
from utils.wallet import pay_from_wallet, add_to_wallet
from utils.socket import send_created_return_order_via_socket

from schemas.order import (
    ReturnOrderRequest,
    BorrowedBooksResponse,
    UpdateReturnOrderStatusRequest,
)


return_order_router = APIRouter(
    prefix="/return-order",
    tags=["Return Order"],
)


@return_order_router.post("/")
async def create_return_order(
    return_return_order_data: ReturnOrderRequest,
    user: User = Depends(get_user),
    db: AsyncSession = Depends(get_db),
):
    borrowed_books = await get_borrowed_books_crud(user.id, db)
    db_borrowed_books_ids = [book.id for book in borrowed_books]

    validate_borrowed_books(return_return_order_data, db_borrowed_books_ids)

    # create return order in db
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
    await db.refresh(return_order)
    await send_created_return_order_via_socket(
        return_order, return_return_order_data.borrowed_books_ids
    )
    return return_order


@return_order_router.get("/borrowed-books", response_model=List[BorrowedBooksResponse])
async def get_borrowed_books(
    user: User = Depends(get_user), db: AsyncSession = Depends(get_db)
):
    borrowed_books = await get_borrowed_books_crud(user.id, db)
    return borrowed_books


@return_order_router.patch(
    "/return-order-status",
    response_model=UpdateReturnOrderStatusRequest,
)
async def update_order_status(
    return_order_data: Annotated[UpdateReturnOrderStatusRequest, Body()],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_staff_user),
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

        if user.role == UserRole.COURIER:
            Validate_return_order_for_courier(return_order_data, db_return_order, user)

        if user.role == UserRole.EMPLOYEE:
            Validate_return_order_for_employee(return_order_data, db_return_order, user)

        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY:
            db_return_order.courier_id = user.id

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
                if book.return_date is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Book with id {book.id} has not been returned yet.",
                    )

                if book.borrow_book_problem == BorrowBookProblem.NORMAL.value:
                    if book.return_date < now_utc:
                        amount_to_withdraw += (
                            now_utc - book.return_date
                        ).days * book.delay_fees_per_day
                    else:
                        amount_to_add += book.deposit_fees
                    pass
                elif (
                    book.borrow_book_problem == BorrowBookProblem.LOST.value
                    or book.borrow_book_problem == BorrowBookProblem.DAMAGED.value
                ):
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
    user: User = Depends(get_staff_user),
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
