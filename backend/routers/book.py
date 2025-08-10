from decimal import Decimal
from typing import Annotated, List

from core.cloudinary import upload_image
from crud.book import (
    create_author_crud,
    create_book,
    create_book_details,
    create_category_crud,
    get_author_by_id,
    get_authors_crud,
    get_book_details_for_update_crud,
    get_books_table_crud,
    get_categories_crud,
    get_category_by_id,
    is_book_exists,
    search_books_by_title,
    update_book_and_stock,
)
from crud.book import (
    get_books_by_status as get_books,
)
from crud.book import (
    update_book_image as update_book_image_crud,
)
from db.database import get_db
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from fastapi.responses import JSONResponse
from schemas.book import (
    AuthorCategorySchema,
    BookDetailsForUpdateResponse,
    BookResponse,
    BookStatus,
    BookTableSchema,
    CreateAuthorCategoryRequest,
    CreateBookRequest,
    UpdateBookData,
)
from sqlalchemy.ext.asyncio import AsyncSession

book_router = APIRouter(prefix="/books", tags=["Books"])


@book_router.get("/authors", response_model=List[AuthorCategorySchema])
async def get_authors(db: AsyncSession = Depends(get_db)):
    return await get_authors_crud(db)


@book_router.get("/categories", response_model=List[AuthorCategorySchema])
async def get_categories(db: AsyncSession = Depends(get_db)):
    return await get_categories_crud(db)


@book_router.get("/search/", response_model=list[BookResponse])
async def search_books(
    title: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    return await search_books_by_title(db, title)


@book_router.get("/status/{status}", response_model=list[BookResponse])
async def get_books_by_status(status: BookStatus, db: AsyncSession = Depends(get_db)):
    return await get_books(db, status)


""" Employee-only endpoints for book management """

# TODO: check courier or manager access


@book_router.post(
    "/authors",
    status_code=status.HTTP_201_CREATED,
    response_model=AuthorCategorySchema,
)
async def create_author(
    author: CreateAuthorCategoryRequest, db: AsyncSession = Depends(get_db)
):
    return await create_author_crud(db, author)


@book_router.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
    response_model=AuthorCategorySchema,
)
async def create_category(
    category: CreateAuthorCategoryRequest, db: AsyncSession = Depends(get_db)
):
    return await create_category_crud(db, category)


@book_router.get("/table", response_model=List[BookTableSchema])
async def get_books_table(
    db: AsyncSession = Depends(get_db),
):
    return await get_books_table_crud(db)


@book_router.get("/{book_id}/details", response_model=BookDetailsForUpdateResponse)
async def get_book_details(book_id: int, db: AsyncSession = Depends(get_db)):
    return await get_book_details_for_update_crud(db, book_id=book_id)


@book_router.post(
    "/create", status_code=status.HTTP_201_CREATED, response_model=BookTableSchema
)
async def create_book_endpoint(
    title: Annotated[str, Form()],
    price: Annotated[Decimal, Form()],
    description: Annotated[str, Form()],
    category_id: Annotated[int, Form()],
    author_id: Annotated[int, Form()],
    publish_year: Annotated[int, Form()],
    purchase_available_stock: Annotated[int, Form()],
    borrow_available_stock: Annotated[int, Form()],
    img_file: Annotated[UploadFile | None, File()] = None,
    db: AsyncSession = Depends(get_db),
):
    if await is_book_exists(db, title, author_id):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Book with this title and author already exists."},
        )

    if not purchase_available_stock and not borrow_available_stock:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "At least one stock type must be provided."},
        )

    secure_url = None
    if img_file:
        secure_url = await upload_image(img_file)

    book_data = CreateBookRequest(
        title=title,
        price=price,
        description=description,
        category_id=category_id,
        author_id=author_id,
        cover_img=secure_url,
        publish_year=publish_year,
    )
    book = await create_book(book_data, db)
    await create_book_details(
        book.id,
        purchase_available_stock,
        borrow_available_stock,
        db=db,
    )

    author = await get_author_by_id(db, author_id)
    category = await get_category_by_id(db, category_id)

    return BookTableSchema(
        id=book.id,
        title=book.title,
        price=f"{book.price:.2f}",
        author_name=author.name,
        category_name=category.name,
        available_stock_purchase=purchase_available_stock,
        available_stock_borrow=borrow_available_stock,
    )


@book_router.patch("/{book_id}", response_model=BookResponse, status_code=200)
async def update_book(
    book_id: int, book_data: UpdateBookData, db: AsyncSession = Depends(get_db)
):
    return await update_book_and_stock(book_id, book_data, db)


@book_router.patch("/{book_id}/image", response_model=BookResponse, status_code=200)
async def update_book_image(
    book_id: int,
    img_file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_db),
):
    secure_url = await upload_image(img_file)
    book_after_update = await update_book_image_crud(book_id, secure_url, db)
    return book_after_update
