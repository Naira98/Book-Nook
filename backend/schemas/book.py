from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from models.book import BookStatus


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


class CreateBookResponse(CreateBookRequest, IdSchema):
    model_config = ConfigDict(from_attributes=True)


class EditBookRequest(BaseModel):
    price: Decimal
    description: str
    category_id: int


class UpdateStockRequest(BaseModel):
    book_id: int
    stock_type: BookStatus
    new_stock: int
