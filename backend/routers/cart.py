from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
import crud.cart as cart_crud
from db.database import get_db
from utils.auth import get_user_id
from schemas.cart import CartResponse


cart_router = APIRouter (
    prefix="/cart",
    tags=["cart"],
)


@cart_router.get("/usercart", response_model=List[CartResponse])
async def read_user_cart(
    user_id:User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    cart_items = await cart_crud.display_cart(db, user_id)    
    return cart_items

@cart_router.post("/addcart")
async def add_to_cart (
    book_details_id: int, 
    quantity: int, 
    user_id:User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db)
):
    cart_item = await cart_crud.add_to_cart(db, user_id, book_details_id, quantity)
    return cart_item

# @cart_router.patch("/update")
# async def update_cart(
#     user_id: int, 
#     book_details_id: int, 
#     quantity: int, 
#     db: AsyncSession = Depends(get_db)
# ):
#     cart_item = await cart_crud.update_cart(db, user_id, book_details_id, quantity)
#     return cart_item

@cart_router.delete("/delete")
async def delete_cart_item(
    book_details_id: int, 
    user_id:User = Depends(get_user_id),
    db: AsyncSession = Depends(get_db)
):
    cart_item = await cart_crud.delete_cart_item(db, user_id, book_details_id)
    return cart_item