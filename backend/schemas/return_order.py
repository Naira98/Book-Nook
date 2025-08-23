from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from models.order import PickUpType, ReturnOrder
from pydantic import BaseModel, ConfigDict, model_validator
from schemas.order import (
    BorrowOrderBookSchema,
    ReturnOrderStatus,
)


class BookSchema(BaseModel):
    id: int
    title: str
    cover_img: str

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class ClientBorrowsResponse(BaseModel):
    book_details_id: int
    borrowing_weeks: int
    expected_return_date: datetime
    deposit_fees: Decimal
    borrow_fees: Decimal
    delay_fees_per_day: Decimal
    book: BookSchema

    model_config = ConfigDict(from_attributes=True)


class ReturnOrderRequest(BaseModel):
    pickup_type: PickUpType
    address: Optional[str]
    phone_number: Optional[str]
    borrowed_books_ids: List[int]


class UserOrderDetails(BaseModel):
    id: int
    created_at: datetime
    address: Optional[str | None] = None
    pickup_type: PickUpType
    status: ReturnOrderStatus
    phone_number: Optional[str | None] = None
    delivery_fees: Optional[Decimal | None] = None
    borrow_order_books_details: List[BorrowOrderBookSchema]
    total_price: Decimal = Decimal("0.0")

    @model_validator(mode="before")
    @classmethod
    def prepare_data(cls, data: ReturnOrder):
        total_price = Decimal("0.0")
        if data.delivery_fees:
            total_price += data.delivery_fees

        for book in data.borrow_order_books_details:
            total_price += (book.borrow_fees * book.borrowing_weeks) + book.deposit_fees

        return {
            "id": data.id,
            "created_at": data.created_at,
            "address": data.address,
            "status": data.status,
            "phone_number": data.phone_number,
            "delivery_fees": data.delivery_fees,
            "pickup_type": data.pickup_type,
            "borrow_order_books_details": data.borrow_order_books_details,
            "total_price": total_price,
        }


class AllUserReturnOrders(BaseModel):
    return_orders: List[UserOrderDetails]

    model_config = ConfigDict(from_attributes=True)
