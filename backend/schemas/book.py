from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from models.book import BookStatus


class IdSchema(BaseModel):
    """Mixin schema for models with an ID."""

    id: int


class BookBase(BaseModel):
    """Base schema for book properties."""

    title: str
    price: Decimal
    description: str
    cover_img: str | None = None

    model_config = ConfigDict(from_attributes=True)


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


class CreateBook(BookBase):
    category_id: int
    author_id: int


class CreateBookResponse(CreateBook, IdSchema):
    model_config = ConfigDict(from_attributes=True)
