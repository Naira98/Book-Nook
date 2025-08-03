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


class BookResponse(IdSchema, BookBase):
    author: AuthorSchema
    category: CategorySchema
    book_details: list[BookDetailsSchema]

    model_config = ConfigDict(from_attributes=True)


class CreateBookRequest(BookBase):
    category_id: int
    author_id: int


class CreateBookResponse(CreateBookRequest, IdSchema):
    model_config = ConfigDict(from_attributes=True)
