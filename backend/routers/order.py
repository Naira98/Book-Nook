from typing import Annotated, List

from db.database import get_db
from fastapi import APIRouter, Depends, status
from models.book import BookDetails
from models.order import (
    BorrowOrderBook,
    Order,
    PurchaseOrderBook,
)
from models.user import User
from schemas.order import OrderResponseSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.auth import get_user


order_router = APIRouter(
    prefix="/order",
    tags=["Orders"],
)


@order_router.get(
    "/", response_model=List[OrderResponseSchema], status_code=status.HTTP_200_OK
)
async def get_orders(
    user: Annotated[User, Depends(get_user)], db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .where(Order.user_id == user.id)
        .options(
            selectinload(Order.borrow_order_books_details).options(
                joinedload(BorrowOrderBook.book_details).options(
                    joinedload(BookDetails.book)
                ),
                joinedload(BorrowOrderBook.return_order),
            ),
            selectinload(Order.purchase_order_books_details).options(
                joinedload(PurchaseOrderBook.book_details).options(
                    joinedload(BookDetails.book)
                )
            ),
        )
        .order_by(Order.created_at.desc())
    )

    result = await db.execute(query)
    orders = result.scalars().unique().all()
    return orders

