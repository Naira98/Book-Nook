from typing import Any

from fastapi import HTTPException, status
from models.book import Book, BookDetails
from models.cart import Cart
from models.user import User
from schemas.cart import BorrowItemResponse, CreateCartItemRequest, PurchaseItemResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.cart import validate_borrowing_limit
from utils.order import calculate_borrow_order_book_fees
from utils.settings import get_settings


async def display_cart(db: AsyncSession, user_id: int):
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


async def read_user_cart_crud(db: AsyncSession, user: User) -> dict[str, Any]:
    settings = await get_settings(db)
    cart_items = await display_cart(db, user.id)
    borrow_items = []
    purchase_items = []

    for cart_item in cart_items:
        if (
            cart_item.book_details.status.value == "BORROW"
            and cart_item.borrowing_weeks
        ):
            book_price = cart_item.book_details.book.price

            fees_data = calculate_borrow_order_book_fees(
                book_price=book_price,
                borrowing_weeks=1,
                borrow_perc=settings.borrow_perc,
                deposit_perc=settings.deposit_perc,
                delay_perc=settings.delay_perc,
                min_borrow_fee=settings.min_borrow_fee,
            )

            borrow_object = BorrowItemResponse(
                id=cart_item.id,
                book_details_id=cart_item.book_details_id,
                borrowing_weeks=cart_item.borrowing_weeks,
                borrow_fees_per_week=fees_data["borrow_fees_per_week"],
                deposit_fees=fees_data["deposit_fees"],
                delay_fees_per_day=fees_data["delay_fees_per_day"],
                book=cart_item.book_details.book,
            )

            borrow_items.append(borrow_object)

        elif cart_item.book_details.status.value == "PURCHASE":
            purchase_object = PurchaseItemResponse(
                id=cart_item.id,
                book_details_id=cart_item.book_details_id,
                quantity=cart_item.quantity,
                book=cart_item.book_details.book,
                book_price=cart_item.book_details.book.price,
            )

            purchase_items.append(purchase_object)

    delivery_fees = settings.delivery_fees

    remaining_borrow_books_count = settings.max_num_of_borrow_books - (
        user.current_borrowed_books + len(borrow_items)
    )

    return {
        "purchase_items": purchase_items,
        "borrow_items": borrow_items,
        "delivery_fees": delivery_fees,
        "remaining_borrow_books_count": remaining_borrow_books_count,
    }


async def add_to_cart_crud(
    db: AsyncSession,
    user: User,
    cart_item_data: CreateCartItemRequest,
    book_details: BookDetails,
):
    if book_details.status.value == "BORROW":
        settings = await get_settings(db)
        cart_item = Cart(
            user_id=user.id,
            book_details_id=cart_item_data.book_details_id,
            quantity=1,
            borrowing_weeks=cart_item_data.borrowing_weeks,
        )
        db.add(cart_item)

        # Validate after adding to cart
        await validate_borrowing_limit(db, user, settings.max_num_of_borrow_books)
        try:
            await db.commit()
            await db.refresh(cart_item)
            return cart_item
        except Exception as e:
            await db.rollback()
            raise e

    elif book_details.status.value == "PURCHASE":
        existing_item = await db.execute(
            select(Cart).where(
                Cart.user_id == user.id,
                Cart.book_details_id == cart_item_data.book_details_id,
            )
        )
        existing_item = existing_item.scalars().first()
        try:
            if existing_item:
                if (
                    existing_item.quantity + cart_item_data.quantity
                    > book_details.available_stock
                ):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Cannot add {cart_item_data.quantity} more. Only {book_details.available_stock - existing_item.quantity} left in stock.",
                    )
                existing_item.quantity += cart_item_data.quantity
                await db.commit()
                await db.refresh(existing_item)
                return existing_item
            else:
                cart_item = Cart(
                    user_id=user.id,
                    book_details_id=cart_item_data.book_details_id,
                    quantity=cart_item_data.quantity,
                )
                db.add(cart_item)
                await db.commit()
                # await db.refresh(cart_item)
                # return cart_item
        except Exception as e:
            await db.rollback()
            raise e


async def delete_cart_item_crud(db: AsyncSession, user_id: int, cart_item_id: int):
    try:
        cart_item = await db.execute(
            select(Cart)
            .options(joinedload(Cart.book_details))
            .where(Cart.user_id == user_id, Cart.id == cart_item_id)
        )
        cart_item = cart_item.scalars().first()
        if cart_item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cart item with id {cart_item_id} not found for this user.",
            )
        else:
            await db.delete(cart_item)
            await db.commit()
        # return cart_item
    except Exception as e:
        await db.rollback()
        raise e


async def get_cart_item(db: AsyncSession, user_id: int, cart_item_id: int):
    cart_item = await db.execute(
        select(Cart)
        .options(joinedload(Cart.book_details))
        .where(Cart.user_id == user_id, Cart.id == cart_item_id)
    )
    cart_item = cart_item.scalars().first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cart item with id {cart_item_id} not found.",
        )
    return cart_item


async def update_cart_item_crud(
    db: AsyncSession,
    cart_item_data: Cart,
    quantity: int | None,
    borrowing_weeks: int | None,
):
    if (
        cart_item_data.book_details.status.value == "BORROW"
        and borrowing_weeks is not None
    ):
        cart_item_data.borrowing_weeks = borrowing_weeks
    elif (
        cart_item_data.book_details.status.value == "PURCHASE" and quantity is not None
    ):
        cart_item_data.quantity = quantity
    try:
        await db.commit()
        # await db.refresh(cart_item_data)
        # return cart_item_data
    except Exception as e:
        await db.rollback()
        raise e
