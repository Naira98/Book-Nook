from datetime import datetime
from typing import List, Optional

from models.book import BookStatus
from models.order import BorrowBookProblem, OrderStatus, PickUpType, ReturnOrderStatus
from pydantic import BaseModel, ConfigDict


class BookSchema(BaseModel):
    id: int
    title: str
    cover_img: Optional[str]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class BookDetailsSchema(BaseModel):
    id: int
    status: BookStatus
    book: BookSchema

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class ReturnOrderSchema(BaseModel):
    id: int
    pick_up_type: str
    status: ReturnOrderStatus
    address: str
    phone_number: str
    created_at: datetime
    delivery_fees: Optional[float]
    courier_id: Optional[int]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class BorrowOrderBookSchema(BaseModel):
    id: int
    borrowing_weeks: int
    borrow_book_problem: BorrowBookProblem
    borrow_fees: float
    promocode_discount: Optional[float]
    return_date: Optional[datetime]
    deposit_fees: float
    delay_fees_per_day: float
    return_order: Optional[ReturnOrderSchema]
    book_details: BookDetailsSchema
    original_book_price: float

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class PurchaseOrderBookSchema(BaseModel):
    id: int
    quantity: int
    paid_price_per_book: float
    promocode_discount_per_book: Optional[float]
    book_details: BookDetailsSchema

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class OrderResponseSchema(BaseModel):
    id: int
    created_at: datetime
    address: str
    pick_up_date: Optional[datetime]
    pick_up_type: PickUpType
    delivery_fees: Optional[float]
    promo_code_id: Optional[int]
    phone_number: str
    status: OrderStatus
    user_id: int
    borrow_order_books_details: List[BorrowOrderBookSchema]
    purchase_order_books_details: List[PurchaseOrderBookSchema]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class BorrowBookItem(BaseModel):
    book_details_id: int
    borrowing_weeks: int


class PurchaseBookItem(BaseModel):
    book_details_id: int
    quantity: int


class CreateOrderRequest(BaseModel):
    borrow_books: list[BorrowBookItem] = []
    purchase_books: list[PurchaseBookItem] = []
    pick_up_type: PickUpType
    address: str
    phone_number: str
    promocode_id: Optional[int] = None


class OrderCeatedUpdateResponseBase(BaseModel):
    message: str

    model_config = ConfigDict(from_attributes=True)


class OrderCreatedUpdateResponse(OrderCeatedUpdateResponseBase):
    order_id: int

    model_config = ConfigDict(from_attributes=True)


class BorrowOrderBookUpdateProblemResponse(OrderCeatedUpdateResponseBase):
    borrow_order_book_id: int

    model_config = ConfigDict(from_attributes=True)
