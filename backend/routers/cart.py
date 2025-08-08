from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Body, Path
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from crud.cart import display_cart, add_to_cart_crud, delete_cart_item_crud
from db.database import get_db
from utils.auth import get_user_id
from schemas.cart import (
    CartItemsResponse,
    CrateCartItem,
    PurchaseItemResponse,
    BorrowItemResponse,
)
from utils.settings import get_settings
from utils.order import calculate_borrow_order_book_fees


cart_router = APIRouter(
    prefix="/cart",
    tags=["cart"],
)


@cart_router.get(
    "/usercart",
    response_model=CartItemsResponse,
)
async def read_user_cart(
    user_id: User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    settings = await get_settings(db)
    cart_items = await display_cart(db, user_id)
    borrow_items = []
    purchase_items = []

    for cart_item in cart_items:
        if cart_item.book_details.status.value == "BORROW":
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
                book_details_id=cart_item.book_details_id,
                borrow_weeks=1,
                borrow_fees_per_week=fees_data["boorow_fees_per_week"],
                deposit_fees=fees_data["deposit_fees"],
                delay_fees_per_day=fees_data["delay_fees_per_day"],
                book=cart_item.book_details.book,
            )

            for _ in range(cart_item.quantity):
                borrow_items.append(borrow_object)

        elif cart_item.book_details.status.value == "PURCHASE":
            purchase_object = PurchaseItemResponse(
                book_details_id=cart_item.book_details_id,
                quantity=cart_item.quantity,
                book=cart_item.book_details.book,
                book_price=cart_item.book_details.book.price,
            )

            purchase_items.append(purchase_object)

    delivery_fees = settings.delivery_fees

    return {
        "purchase_items": purchase_items,
        "borrow_items": borrow_items,
        "delevary_fees": delivery_fees,
    }


@cart_router.post("/addcart", response_model=CrateCartItem, status_code=201)
async def add_to_cart(
    book_details_id: Annotated[int, Body()],
    quantity: Annotated[int, Body()],
    user_id: User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    cart_item = await add_to_cart_crud(db, user_id, book_details_id, quantity)
    return cart_item


@cart_router.delete("/{book_details_id}")
async def delete_cart_item(
    book_details_id: Annotated[int, Path()],
    user_id: User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    was_deleted = await delete_cart_item_crud(db, user_id, book_details_id)
    if not was_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cart item for book details ID {book_details_id} not found.",
        )
    return {"message": "Cart item deleted successfully."}
