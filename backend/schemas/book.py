from decimal import Decimal
from typing import Optional

from models.book import Book, BookStatus
from pydantic import BaseModel, ConfigDict, Field


class IdSchema(BaseModel):
    id: int


class BookBase(BaseModel):
    title: str
    price: Decimal
    description: str
    cover_img: str | None = None


class CreateAuthorCategoryRequest(BaseModel):
    name: str


class AuthorCategorySchema(CreateAuthorCategoryRequest, IdSchema):
    model_config = ConfigDict(from_attributes=True)


class BookDetailsSchema(BaseModel):
    status: BookStatus
    available_stock: int

    model_config = ConfigDict(from_attributes=True)


class BookResponse(BookBase, IdSchema):
    author: AuthorCategorySchema
    category: AuthorCategorySchema
    book_details: list[BookDetailsSchema]

    model_config = ConfigDict(from_attributes=True)


class CreateBookRequest(BookBase):
    category_id: int
    author_id: int
    publish_year: int


class UpdateBookData(BaseModel):
    title: str
    price: str
    description: str
    publish_year: int
    cover_img: Optional[str] = None
    category_id: int
    author_id: int
    purchase_available_stock: int
    borrow_available_stock: int


""" NEW CLEAN SCHEMAS FOR REACTORING """


class AuthorBase(BaseModel):
    id: int
    name: str


class CategoryBase(BaseModel):
    id: int
    name: str


class GetBookBase(BaseModel):
    book_details_id: int
    title: str
    category: CategoryBase
    author: AuthorBase
    available_stock: int
    book_id: int


class BorrowBookResponse(GetBookBase):
    borrow_fees_per_week: Decimal
    deposit_fees: Decimal


class PurchaseBookResponse(GetBookBase):
    price: Decimal


""" Employee-only schema for book management """


class BookTableSchema(BaseModel):
    id: int
    title: str
    price: Decimal
    author_name: str = Field(..., alias="author_name")  # Alias to match the joined data
    category_name: str = Field(..., alias="category_name")
    available_stock_purchase: Optional[int] = None
    available_stock_borrow: Optional[int] = None

    class Config:
        from_attributes = True
        json_encoders = {Decimal: lambda v: str(v)}


class BookDetailsForUpdateResponse(BaseModel):
    id: int
    title: str
    price: Decimal
    description: Optional[str]
    cover_img: Optional[str]
    publish_year: int
    category_id: int
    author_id: int
    purchase_available_stock: int = 0
    borrow_available_stock: int = 0

    @classmethod
    def from_orm(cls, obj: "Book"):
        purchase_stock = 0
        borrow_stock = 0
        for details in obj.book_details:
            if details.status == BookStatus.PURCHASE:
                purchase_stock = details.available_stock
            elif details.status == BookStatus.BORROW:
                borrow_stock = details.available_stock

        return cls(
            id=obj.id,
            title=obj.title,
            price=obj.price,
            description=obj.description,
            cover_img=obj.cover_img,
            publish_year=obj.publish_year,
            category_id=obj.category_id,
            author_id=obj.author_id,
            purchase_available_stock=purchase_stock,
            borrow_available_stock=borrow_stock,
        )

    class Config:
        from_attributes = True
