from decimal import Decimal
from typing import List
from pydantic import BaseModel, ConfigDict
from .book import AuthorSchema 

class CartCreate(BaseModel):
    book_details_id:int 
    quantity: int 

# This new schema correctly represents the Book model for the cart view
class BookInfoForCart(BaseModel):
    id: int
    title: str
    cover_img: str | None = None
    price: Decimal
    author: AuthorSchema
    model_config = ConfigDict(from_attributes=True)

# This schema represents the BookDetails model, which contains the Book
class BookDetailsResponseForCart(BaseModel):
    book: BookInfoForCart
    model_config = ConfigDict(from_attributes=True)

# The final response model for a single cart item
class CartResponse(BaseModel):
    quantity: int
    book_details_id: int
    book_details: BookDetailsResponseForCart
    model_config = ConfigDict(from_attributes=True)

