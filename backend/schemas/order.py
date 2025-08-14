from datetime import datetime
from typing import Any, List, Optional, TypedDict

from models.book import BookStatus
from models.order import (
    BorrowBookProblem,
    OrderStatus,
    PickUpType,
    ReturnOrderStatus,
)
from pydantic import BaseModel, ConfigDict, model_validator


class BookSchema(BaseModel):
    id: int
    title: str
    cover_img: str

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class BookDetailsSchema(BaseModel):
    id: int
    status: BookStatus
    book: BookSchema

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class ReturnOrderRequest(BaseModel):
    pickup_type: PickUpType
    status: ReturnOrderStatus
    address: str
    phone_number: str
    borrowed_books_ids: List[int]


class BorrowedBooksResponse(BaseModel):
    id: int
    borrowing_weeks: int
    actual_return_date: Optional[datetime]
    expected_return_date: Optional[datetime]
    book: BookSchema

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Any):
        return {
            "id": data.id,
            "borrowing_weeks": data.borrowing_weeks,
            "actual_return_date": data.actual_return_date,
            "expected_return_date": data.expected_return_date,
            "book": data.book_details.book,
        }

    model_config = ConfigDict(from_attributes=True)


class BorrowOrderBookSchema(BaseModel):
    id: int
    borrowing_weeks: int
    borrow_book_problem: BorrowBookProblem
    borrow_fees: float
    promo_code_discount: Optional[float]
    actual_return_date: Optional[datetime]
    expected_return_date: Optional[datetime]
    deposit_fees: float
    delay_fees_per_day: float
    return_order_id: Optional[int]
    book_details: BookDetailsSchema
    original_book_price: float

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class PurchaseOrderBookSchema(BaseModel):
    id: int
    quantity: int
    paid_price_per_book: float
    promo_code_discount_per_book: Optional[float]
    book_details: BookDetailsSchema

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class OrderResponseSchema(BaseModel):
    id: int
    created_at: datetime
    address: str
    pickup_date: Optional[datetime]
    pickup_type: PickUpType
    delivery_fees: Optional[float]
    promo_code_id: Optional[int]
    phone_number: str
    status: OrderStatus
    user_id: int
    borrow_order_books_details: List[BorrowOrderBookSchema]
    purchase_order_books_details: List[PurchaseOrderBookSchema]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class GetAllOrdersUserResponse(BaseModel):
    first_name: str
    last_name: str
    pass


class OrderDetailsResponseUser(GetAllOrdersUserResponse):
    email: str


class OrderDetailsResponseSchema(OrderResponseSchema):
    user: OrderDetailsResponseUser
    number_of_books: int


class CreateOrderRequest(BaseModel):
    pickup_type: PickUpType
    address: str
    phone_number: str
    promo_code_id: Optional[int] = None


class OrderCeatedUpdateResponseBase(BaseModel):
    message: str

    model_config = ConfigDict(from_attributes=True)


class OrderCreatedUpdateResponse(OrderCeatedUpdateResponseBase):
    order_id: int

    model_config = ConfigDict(from_attributes=True)


class BorrowOrderBookUpdateProblemResponse(OrderCeatedUpdateResponseBase):
    borrow_order_book_id: int

    model_config = ConfigDict(from_attributes=True)


class AllOrdersResponseBase(BaseModel):
    id: int
    created_at: datetime
    address: str
    pickup_type: PickUpType
    phone_number: str
    user: GetAllOrdersUserResponse
    number_of_books: int
    courier_id: Optional[int]


class AllOrdersResponse(AllOrdersResponseBase):
    pickup_date: Optional[datetime]
    status: OrderStatus


class ReturnOrderResponse(AllOrdersResponseBase):
    status: ReturnOrderStatus


class GetAllOrdersResponse(BaseModel):
    orders: list[AllOrdersResponse]
    return_orders: list[ReturnOrderResponse]


class UpdateOrderStatusRequest(AllOrdersResponse):
    pass


class UpdateReturnOrderStatusRequest(ReturnOrderResponse):
    borrow_order_books_details: Optional[list[BorrowOrderBookSchema] | None] = None
    model_config = ConfigDict(from_attributes=True)


class UpdateOrderStatusResponse(AllOrdersResponse):
    model_config = ConfigDict(from_attributes=True)


""" TypedDict not pydantic schema """
class BorrowBookItem(TypedDict):
    book_details_id: int
    borrowing_weeks: int


class PurchaseBookItem(TypedDict):
    book_details_id: int
    quantity: int


class UserCart(TypedDict):
    borrow_books: List[BorrowBookItem]
    purchase_books: List[PurchaseBookItem]
