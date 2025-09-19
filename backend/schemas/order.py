from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional, TypedDict

from models.book import BookStatus
from models.order import (
    BorrowBookProblem,
    Order,
    OrderStatus,
    PickUpType,
    ReturnOrder,
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


class BorrowOrderBookSchema(BaseModel):
    id: int
    borrowing_weeks: int
    borrow_book_problem: BorrowBookProblem
    borrow_fees: Decimal
    promo_code_discount: Optional[Decimal]
    actual_return_date: Optional[datetime]
    expected_return_date: Optional[datetime]
    deposit_fees: Decimal
    delay_fees_per_day: Decimal
    return_order_id: Optional[int]
    book_details: BookDetailsSchema
    original_book_price: Decimal

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class PurchaseOrderBookSchema(BaseModel):
    id: int
    quantity: int
    paid_price_per_book: Decimal
    promo_code_discount_per_book: Optional[Decimal]
    book_details: BookDetailsSchema

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class OrderResponseSchema(BaseModel):
    id: int
    created_at: datetime
    address: Optional[str]
    pickup_date: Optional[datetime]
    pickup_type: PickUpType
    delivery_fees: Optional[Decimal]
    promo_code_id: Optional[int]
    phone_number: Optional[str]
    status: OrderStatus
    user_id: int
    borrow_order_books_details: List[BorrowOrderBookSchema]
    purchase_order_books_details: List[PurchaseOrderBookSchema]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class GetAllOrdersUserResponse(BaseModel):
    first_name: str
    last_name: str


class OrderDetailsResponseUser(GetAllOrdersUserResponse):
    email: str


class OrderDetailsResponseSchema(OrderResponseSchema):
    user: OrderDetailsResponseUser
    number_of_books: int

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Order):
        number_of_purchase_books = 0

        for book in data.purchase_order_books_details:
            number_of_purchase_books += book.quantity

        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pickup_date": data.pickup_date,
            "pickup_type": data.pickup_type,
            "delivery_fees": data.delivery_fees,
            "promo_code_id": data.promo_code_id,
            "phone_number": data.phone_number,
            "status": data.status,
            "user_id": data.user_id,
            "borrow_order_books_details": data.borrow_order_books_details,
            "purchase_order_books_details": data.purchase_order_books_details,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details)
            + number_of_purchase_books,
        }


class CreateOrderRequest(BaseModel):
    pickup_type: PickUpType
    address: Optional[str] = None
    phone_number: Optional[str] = None
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
    address: Optional[str]
    pickup_type: PickUpType
    phone_number: Optional[str]
    user: OrderDetailsResponseUser
    number_of_books: int = 0
    courier_id: Optional[int]


class AllOrdersResponse(AllOrdersResponseBase):
    pickup_date: Optional[datetime]
    status: OrderStatus

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Any):
        if not isinstance(data, Order):
            return data
        number_of_purchase_books = 0

        for book in data.purchase_order_books_details:
            number_of_purchase_books += book.quantity

        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pickup_type": data.pickup_type,
            "phone_number": data.phone_number,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details)
            + number_of_purchase_books,
            "courier_id": data.courier_id,
            "pickup_date": data.pickup_date,
            "status": data.status,
        }


class UpdateOrderStatusRequest(BaseModel):
    order_id: int
    status: OrderStatus


class ReturnOrderResponse(AllOrdersResponseBase):
    status: ReturnOrderStatus

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Any):
        if not isinstance(data, ReturnOrder):
            return data
        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pickup_type": data.pickup_type,
            "phone_number": data.phone_number,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details),
            "courier_id": data.courier_id,
            "status": data.status,
        }


class GetAllOrdersResponse(BaseModel):
    orders: list[AllOrdersResponse]
    return_orders: list[ReturnOrderResponse]


class UpdateReturnOrderStatusRequest(AllOrdersResponseBase):
    status: ReturnOrderStatus
    borrow_order_books_details: Optional[list[BorrowOrderBookSchema] | None] = None

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Any):
        if not isinstance(data, ReturnOrder):
            return data
        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pickup_type": data.pickup_type,
            "phone_number": data.phone_number,
            "user": data.user,
            "number_of_books": len(data.borrow_order_books_details),
            "courier_id": data.courier_id,
            "status": data.status,
            "borrow_order_books_details": data.borrow_order_books_details,
        }

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


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


class UserOrderDetails(BaseModel):
    id: int
    created_at: datetime
    address: Optional[str | None] = None
    pickup_date: Optional[datetime | None] = None
    status: OrderStatus
    phone_number: Optional[str | None] = None
    delivery_fees: Optional[Decimal | None] = None
    promo_code_id: Optional[int | None] = None
    pickup_type: PickUpType
    borrow_order_books_details: List[BorrowOrderBookSchema]
    purchase_order_books_details: List[PurchaseOrderBookSchema]
    total_price: Decimal = Decimal("0.0")

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: Order):
        total_price = Decimal("0.0")
        if data.delivery_fees:
            total_price += data.delivery_fees

        for book in data.borrow_order_books_details:
            total_price += book.borrow_fees + book.deposit_fees

        for book in data.purchase_order_books_details:
            total_price += book.paid_price_per_book * book.quantity

        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "pickup_date": data.pickup_date,
            "status": data.status,
            "phone_number": data.phone_number,
            "delivery_fees": data.delivery_fees,
            "promo_code_id": data.promo_code_id,
            "pickup_type": data.pickup_type,
            "borrow_order_books_details": data.borrow_order_books_details,
            "purchase_order_books_details": data.purchase_order_books_details,
            "total_price": total_price,
        }


class AllUserOrders(BaseModel):
    orders: List[UserOrderDetails]

    model_config = ConfigDict(from_attributes=True)
