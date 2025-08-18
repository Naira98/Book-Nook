from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from models.order import PickUpType
from pydantic import BaseModel, ConfigDict


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
