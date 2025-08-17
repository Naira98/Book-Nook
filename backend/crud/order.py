from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload
from models.book import BookDetails
from sqlalchemy.ext.asyncio import AsyncSession
from models.order import BorrowOrderBook, ReturnOrder
from typing import Sequence
from schemas.order import ReturnOrderRequest
from decimal import Decimal


async def get_borrowed_books_crud(
    user_id: int,
    db: AsyncSession,
) -> Sequence[BorrowOrderBook]:
    stmt = (
        select(BorrowOrderBook)
        .options(
            selectinload(BorrowOrderBook.book_details).options(
                joinedload(BookDetails.book)
            )
        )
        .where(
            BorrowOrderBook.user_id == user_id,
            BorrowOrderBook.return_order_id == None,  # noqa: E711
        )
    )
    result = await db.execute(stmt)
    borrowed_books = result.scalars().all()
    if not borrowed_books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No borrowed books found for this user.",
        )

    return borrowed_books


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
