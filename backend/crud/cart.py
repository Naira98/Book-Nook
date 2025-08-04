from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.cart import Cart
from models.book import Book, BookDetails


async def display_cart( db: AsyncSession,user_id: int ):

    stmt = (
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(
            selectinload(Cart.book_details)
            .selectinload(BookDetails.book)
            .selectinload(Book.author)
        )
        .order_by(Cart.book_details_id.desc())
    )
    result = await db.execute(stmt)
    cart_items = result.scalars().all()
    return cart_items

async def add_to_cart(db: AsyncSession, user_id: int, book_details_id: int, quantity: int):

    existing_item = await db.execute(
        select(Cart).where(
            Cart.user_id == user_id,
            Cart.book_details_id == book_details_id
        )
    )
    existing_item = existing_item.scalars().first()

    if existing_item:
        existing_item.quantity = quantity
        await db.commit()
        await db.refresh(existing_item)
        return existing_item
    else:
        cart_item = Cart(user_id=user_id, book_details_id=book_details_id, quantity=quantity)
        db.add(cart_item)
        await db.commit()
        await db.refresh(cart_item)
        return cart_item    



async def delete_cart_item(db: AsyncSession, user_id: int, book_details_id: int):
    cart_item = await db.execute(
        select(Cart).where(
            Cart.user_id == user_id,
            Cart.book_details_id == book_details_id
        )
    )    
    cart_item = cart_item.scalars().first()
    if cart_item:
        await db.delete(cart_item)
        await db.commit()
        return True
    return False
    