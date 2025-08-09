from decimal import Decimal
from typing import Optional

from models.book import BookStatus
from pydantic import BaseModel, ConfigDict, Field


class IdSchema(BaseModel):
    id: int


class BookBase(BaseModel):
    title: str
    price: Decimal
    description: str
    cover_img: str | None = None


class AuthorSchema(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CategorySchema(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class BookDetailsSchema(BaseModel):
    status: BookStatus
    available_stock: int

    model_config = ConfigDict(from_attributes=True)


class BookResponse(BookBase, IdSchema):
    author: AuthorSchema
    category: CategorySchema
    book_details: list[BookDetailsSchema]

    model_config = ConfigDict(from_attributes=True)


class CreateBookRequest(BookBase):
    category_id: int
    author_id: int
    publish_year: int


class EditBookRequest(BaseModel):
    price: Decimal
    description: str
    category_id: int


class UpdateStockRequest(BaseModel):
    book_id: int
    stock_type: BookStatus
    new_stock: int


""" Employee-only schema for book management """
class BookTableSchema(BaseModel):
    id: int
    title: str
    price: str
    author_name: str = Field(..., alias="author_name")  # Alias to match the joined data
    category_name: str = Field(..., alias="category_name")
    available_stock_purchase: Optional[int] = None
    available_stock_borrow: Optional[int] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: str(v)  # Ensure Decimal is serialized as string
        }

