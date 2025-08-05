from fastapi import APIRouter, Depends, Query, UploadFile, Form, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from crud.book import (
    search_books_by_title,
    get_books_by_status as get_books,
    create_book,
    is_book_exists,
    update_book as update_book_crud,
    update_book_image as update_book_image_crud,
    create_book_details,
)
from schemas.book import (
    BookResponse,
    BookStatus,
    CreateBookRequest,
    CreateBookResponse,
    EditBookRequest,
)
from typing import Annotated
from decimal import Decimal
from core.cloudinary import upload_image

book_router = APIRouter(prefix="/books", tags=["Books"])


@book_router.get("/search/", response_model=list[BookResponse])
async def search_books(
    title: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    return await search_books_by_title(db, title)


@book_router.get("/status/{status}", response_model=list[BookResponse])
async def get_books_by_status(status: BookStatus, db: AsyncSession = Depends(get_db)):
    return await get_books(db, status)


@book_router.post(
    "/create", status_code=status.HTTP_201_CREATED, response_model=CreateBookResponse
)
async def create_book_endpoint(
    title: Annotated[str, Form()],
    price: Annotated[Decimal, Form()],
    description: Annotated[str, Form()],
    category_id: Annotated[int, Form()],
    author_id: Annotated[int, Form()],
    img_file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_db),
    porchase_available_stock: Annotated[int | None, Form()] = None,
    borrow_available_stock: Annotated[int | None, Form()] = None,
):
    if await is_book_exists(db, title, author_id):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Book with this title and author already exists."},
        )

    if not porchase_available_stock and not borrow_available_stock:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "At least one stock type must be provided."},
        )

    secure_url = await upload_image(img_file)

    book_data = CreateBookRequest(
        title=title,
        price=price,
        description=description,
        category_id=category_id,
        author_id=author_id,
        cover_img=secure_url,
    )
    book = await create_book(book_data, db)
    await create_book_details(
        book.id,
        porchase_available_stock,
        borrow_available_stock,
        db=db,
    )


@book_router.patch("/update/{book_id}", response_model=BookResponse, status_code=200)
async def update_book(
    book_id: int, book_data: EditBookRequest, db: AsyncSession = Depends(get_db)
):
    book_after_update = await update_book_crud(book_id, book_data, db)

    return book_after_update


@book_router.patch(
    "/update/{book_id}/image", response_model=BookResponse, status_code=200
)
async def update_book_image(
    book_id: int,
    img_file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_db),
):
    secure_url = await upload_image(img_file)
    book_after_update = await update_book_image_crud(book_id, secure_url, db)
    return book_after_update
