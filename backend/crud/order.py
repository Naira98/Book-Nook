from decimal import Decimal

from fastapi import HTTPException, status
from models.book import BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    OrderStatus,
    ReturnOrder,
)
from schemas.order import ReturnOrderRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload


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
    user_id: int,
    return_order_data: ReturnOrderRequest,
    delivery_fees: Decimal,
    db: AsyncSession,
):
    return_order = ReturnOrder(
        address=return_order_data.address,
        phone_number=return_order_data.phone_number,
        pickup_type=return_order_data.pickup_type,
        status=return_order_data.status,
        delivery_fees=delivery_fees,
        user_id=user_id,
    )
    try:
        db.add(return_order)
        await db.flush()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create return order: {str(e)}",
        )

    return return_order
