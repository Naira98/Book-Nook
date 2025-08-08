from decimal import Decimal
from typing import List
from pydantic import BaseModel, ConfigDict
from .book import AuthorSchema


class CrateCartItem(BaseModel):
    book_details_id: int
    quantity: int


# This new schema correctly represents the Book model for the cart view
class BookInfoForCart(BaseModel):
    id: int
    title: str
    cover_img: str | None = None
    author: AuthorSchema
    model_config = ConfigDict(from_attributes=True)


class BorrowItemResponse(BaseModel):
    book_details_id: int
    borrow_weeks: int
    borrow_fees_per_week: Decimal
    deposit_fees: Decimal
    delay_fees_per_day: Decimal
    book: BookInfoForCart


class PurchaseItemResponse(BaseModel):
    book_details_id: int
    quantity: int
    book: BookInfoForCart
    book_price: Decimal


class CartItemsResponse(BaseModel):
    purchase_items: List[PurchaseItemResponse] = []
    borrow_items: List[BorrowItemResponse] = []
    delevary_fees: Decimal
