from typing import Annotated, Optional

from crud.cart import (
    add_to_cart_crud,
    delete_cart_item_crud,
    get_cart_item,
    read_user_cart_crud,
    update_cart_item_crud,
)
from db.database import get_db
from fastapi import APIRouter, Body, Depends, Path
from models.user import User
from schemas.cart import (
    CreateCartItemRequest,
    GetCartItemsResponse,
    MessageResponse,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_id_via_session, get_user_via_session
from utils.cart import (
    validate_book_details,
    validate_create_borrow_cart_item,
    validate_create_purchase_cart_item,
    validate_update_cart_item,
)


cart_router = APIRouter(
    prefix="/cart",
    tags=["Cart"],
)


@cart_router.get(
    "/",
    response_model=GetCartItemsResponse,
)
async def read_user_cart(
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    return await read_user_cart_crud(db, user)


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
