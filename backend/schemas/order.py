from datetime import datetime
from typing import List, Optional

from models.book import BookStatus
from models.order import (
    BorrowBookProblem,
    OrderStatus,
    PickUpType,
    ReturnOrderStatus,
    Order,
    ReturnOrder,
)
from pydantic import BaseModel, ConfigDict, model_validator


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
    promo_code_discount: Optional[float]
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
    promo_code_discount_per_book: Optional[float]
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


class GetAllOrdersUserResponse(BaseModel):
    first_name: str
    last_name: str
    pass


class OrderDetailsResponseUser(GetAllOrdersUserResponse):
    email: str


class OrderDetailsResponseSchema(OrderResponseSchema):
    user: OrderDetailsResponseUser
    number_of_books: int

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Order):
        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pick_up_date": data.pick_up_date,
            "pick_up_type": data.pick_up_type,
            "delivery_fees": data.delivery_fees,
            "promo_code_id": data.promo_code_id,
            "phone_number": data.phone_number,
            "status": data.status,
            "user_id": data.user_id,
            "borrow_order_books_details": data.borrow_order_books_details,
            "purchase_order_books_details": data.purchase_order_books_details,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details)
            + len(data.purchase_order_books_details),
        }


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
    pick_up_type: PickUpType
    phone_number: str
    user: GetAllOrdersUserResponse
    number_of_books: int
    courier_id: Optional[int]


class AllOrdersResponse(AllOrdersResponseBase):
    pick_up_date: Optional[datetime]
    status: OrderStatus

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Order):
        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pick_up_type": data.pick_up_type,
            "phone_number": data.phone_number,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details)
            + len(data.purchase_order_books_details),
            "courier_id": data.courier_id,
            "pick_up_date": data.pick_up_date,
            "status": data.status,
        }


class AllReturnOrdersResponse(AllOrdersResponseBase):
    status: ReturnOrderStatus

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: ReturnOrder):
        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pick_up_type": data.pick_up_type,
            "phone_number": data.phone_number,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details),
            "courier_id": data.courier_id,
            "status": data.status,
        }


class GetAllOrdersResponse(BaseModel):
    orders: list[AllOrdersResponse]
    return_orders: list[AllReturnOrdersResponse]


class UpdateOrderStatusRequest(AllOrdersResponse):
    pass


class UpdateOrderStatusResponse(AllOrdersResponse):
    model_config = ConfigDict(from_attributes=True)
