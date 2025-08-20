from typing import Annotated, Optional

from crud.cart import (
    add_to_cart_crud,
    delete_cart_item_crud,
    display_cart,
    get_cart_item,
    update_cart_item_crud,
)
from db.database import get_db
from fastapi import APIRouter, Body, Depends, Path
from models.user import User
from schemas.cart import (
    BorrowItemResponse,
    CreateCartItemRequest,
    GetCartItemsResponse,
    MessageResponse,
    PurchaseItemResponse,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_id_via_session, get_user_via_session
from utils.cart import (
    validate_book_details,
    validate_create_borrow_cart_item,
    validate_create_purchase_cart_item,
    validate_update_cart_item,
)
from utils.order import calculate_borrow_order_book_fees
from utils.settings import get_settings

cart_router = APIRouter(
    prefix="/cart",
    tags=["cart"],
)


@cart_router.get(
    "/",
    response_model=GetCartItemsResponse,
)
async def read_user_cart(
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
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
        "delevary_fees": delivery_fees,
        "remaining_borrow_books_count": remaining_borrow_books_count,
    }


@cart_router.post("/", response_model=MessageResponse, status_code=201)
async def add_to_cart(
    cart_data: Annotated[CreateCartItemRequest, Body()],
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    book_details = await validate_book_details(db, cart_data)
    if book_details.status.value == "BORROW":
        validate_create_borrow_cart_item(db, book_details, cart_data)

    elif book_details.status.value == "PURCHASE":
        validate_create_purchase_cart_item(book_details, cart_data)

    await add_to_cart_crud(db, user, cart_data, book_details)
    return {"message": "Book added successfully to cart"}


@cart_router.patch("/", response_model=MessageResponse)
async def update_cart_item(
    cart_item_id: Annotated[int, Body()],
    quantity: Annotated[Optional[int], Body()] = None,
    borrowing_weeks: Annotated[Optional[int], Body()] = None,
    user_id: User = Depends(get_user_id_via_session),
    db: AsyncSession = Depends(get_db),
):
    cart_item_data = await get_cart_item(db, user_id, cart_item_id)
    validate_update_cart_item(db, cart_item_data, quantity, borrowing_weeks)

    await update_cart_item_crud(db, cart_item_data, quantity, borrowing_weeks)
    return {"message": "Book updated successfully"}


@cart_router.delete("/{cart_item_id}", response_model=MessageResponse)
async def delete_cart_item(
    cart_item_id: Annotated[int, Path()],
    user_id: User = Depends(get_user_id_via_session),
    db: AsyncSession = Depends(get_db),
):
    await delete_cart_item_crud(db, user_id, cart_item_id)
    return {"message": "Book deleted successfully from cart"}
