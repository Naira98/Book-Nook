from decimal import Decimal

from fastapi import HTTPException, status
from utils.socket import send_created_return_order
from models.book import BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    OrderStatus,
    PickUpType,
    ReturnOrder,
    ReturnOrderStatus,
)
from models.user import User
from schemas.return_order import ReturnOrderRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.settings import get_settings
from utils.wallet import pay_from_wallet


async def get_client_borrows_books_crud(
    user_id: int,
    db: AsyncSession,
):
    stmt = (
        select(BorrowOrderBook)
        .join(Order, BorrowOrderBook.order_id == Order.id)
        .options(
            selectinload(BorrowOrderBook.book_details).options(
                joinedload(BookDetails.book)
            )
        )
        .where(
            BorrowOrderBook.user_id == user_id,
            BorrowOrderBook.return_order_id.is_(None),
            Order.status == OrderStatus.PICKED_UP,
            BorrowOrderBook.borrow_book_problem == BorrowBookProblem.NORMAL,
        )
    )
    result = await db.execute(stmt)
    borrowed_books = result.scalars().unique().all()

    serialized_books = [
        {
            "book_details_id": book.id,
            "borrowing_weeks": book.borrowing_weeks,
            "expected_return_date": book.expected_return_date,
            "deposit_fees": book.deposit_fees,
            "borrow_fees": book.borrow_fees,
            "delay_fees_per_day": book.delay_fees_per_day,
            "book": {
                "id": book.book_details.book.id,
                "title": book.book_details.book.title,
                "cover_img": book.book_details.book.cover_img,
            },
        }
        for book in borrowed_books
    ]

    return serialized_books


async def create_return_order_crud(
    user: User,
    return_order_data: ReturnOrderRequest,
    db: AsyncSession,
):
    delivery_fees = Decimal("0.0")

    if return_order_data.pickup_type == PickUpType.COURIER:
        if not return_order_data.address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Address is required for courier pickup.",
            )
        if not return_order_data.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is required for courier pickup.",
            )

        settings = await get_settings(db)

        delivery_fees = Decimal(settings.delivery_fees)


    return_order = ReturnOrder(
        address=return_order_data.address,
        phone_number=return_order_data.phone_number,
        pickup_type=return_order_data.pickup_type,
        status=ReturnOrderStatus.CREATED,
        delivery_fees=delivery_fees,
        user_id=user.id,
    )

    db.add(return_order)
    await db.flush()

    if return_order_data.pickup_type == PickUpType.COURIER:
        await pay_from_wallet(
            db=db,
            user=user,
            amount=delivery_fees,
            description=f"Delivery fees for Return Order #{return_order.id}",
            apply_negative_balance=False,
        )

    stmt_books_to_return = (
        select(BorrowOrderBook)
        .where(
            BorrowOrderBook.id.in_(return_order_data.borrowed_books_ids),
            BorrowOrderBook.user_id == user.id,
            BorrowOrderBook.return_order_id.is_(None),
        )
        .options(selectinload(BorrowOrderBook.order))
    )

    result_books_to_return = await db.execute(stmt_books_to_return)
    books_to_update = result_books_to_return.scalars().all()

    if len(books_to_update) != len(return_order_data.borrowed_books_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more selected books are not valid for return or not currently loaned to you.",
        )

    for book in books_to_update:
        if book.order.status != OrderStatus.PICKED_UP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book ID {book.id} (Title: {book.book_details.book.title}) has not been picked up yet.",
            )
        if book.borrow_book_problem != BorrowBookProblem.NORMAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book ID {book.id} (Title: {book.book_details.book.title}) has a problem status and cannot be returned normally.",
            )

        book.return_order_id = return_order.id

    await db.commit()
    await db.refresh(return_order)

    await send_created_return_order(return_order, return_order_data.borrowed_books_ids)

    return return_order
