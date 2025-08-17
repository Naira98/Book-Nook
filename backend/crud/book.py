from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert
from sqlalchemy.orm import selectinload, contains_eager
from fastapi.responses import JSONResponse
from models.book import Book, BookDetails, BookStatus
from schemas.book import CreateBookRequest, EditBookRequest, UpdateStockRequest
from fastapi import status, HTTPException
import requests
from langchain_core.documents import Document


# Fetch books by partial match in title (case-insensitive)
async def search_books_by_title(db: AsyncSession, title: str):
    stmt = (
        select(Book)
        .where(Book.title.ilike(f"%{title}%"))
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
        )
    )
    result = await db.execute(stmt)
    books = result.scalars().all()  # to avoid redundant columns data
    return books


# Fetch books based on their status in BookDetails (e.g., 'borrow', 'purchase').
async def get_books_by_status(db: AsyncSession, status: BookStatus):
    stmt = (
        select(Book)
        .join(Book.book_details)
        .where(BookDetails.status == status)
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            contains_eager(Book.book_details),  # Only load the filtered book_details
        )
    )
    result = await db.execute(stmt)
    books = result.unique().scalars().all()
    return books


async def is_book_exists(db: AsyncSession, title: str, author_id: int):
    stmt = select(Book).where(
        Book.title == title,
        Book.author_id == author_id,
    )
    existing_book = await db.execute(stmt)
    existing_book = existing_book.scalars().first()
    return existing_book is not None


async def create_book(book_data: CreateBookRequest, db: AsyncSession):
    try:
        book_to_create = Book(
            **book_data.model_dump(),
        )
        db.add(book_to_create)
        await db.flush()
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Failed to create book"},
        )
    return book_to_create


async def update_book(book_id: int, book_data: EditBookRequest, db: AsyncSession):
    stmt = (
        update(Book)
        .where(Book.id == book_id)
        .values(**book_data.model_dump())
        .returning(Book)
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
        )
    )
    result = await db.execute(stmt)
    book_afterUpdate = result.scalars().first()

    if not book_afterUpdate:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Book not found"},
        )

    await db.commit()

    return book_afterUpdate


async def update_book_image(book_id: int, img_file: str, db: AsyncSession):
    stmt = (
        update(Book)
        .where(Book.id == book_id)
        .values(cover_img=img_file)
        .returning(Book)
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
        )
    )
    result = await db.execute(stmt)
    book_afterUpdate = result.scalars().first()

    if not book_afterUpdate:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Book not found"},
        )

    await db.commit()

    return book_afterUpdate


async def create_book_details(
    book_id: int,
    purchase_available_stock: int | None,
    borrow_available_stock: int | None,
    db: AsyncSession,
):
    rows_to_insert = []
    if purchase_available_stock:
        rows_to_insert.append(
            {
                "book_id": book_id,
                "status": BookStatus.PURCHASE.value,
                "available_stock": purchase_available_stock,
            }
        )
    if borrow_available_stock:
        rows_to_insert.append(
            {
                "book_id": book_id,
                "status": BookStatus.BORROW.value,
                "available_stock": borrow_available_stock,
            }
        )
    try:
        stmt = insert(BookDetails).values(rows_to_insert)
        await db.execute(stmt)
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Failed to create book details",
                "rows_to_insert": rows_to_insert,
            },
        )


async def update_book_stock_crud(new_stock_data: UpdateStockRequest, db: AsyncSession):
    stmt = (
        update(BookDetails)
        .where(
            BookDetails.book_id == new_stock_data.book_id,
            BookDetails.status == new_stock_data.stock_type,
        )
        .values(available_stock=new_stock_data.new_stock)
        .returning(BookDetails)
    )
    try:
        result = await db.execute(stmt)
        book_details_after_update = result.scalars().first()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Failed to update book details"},
        )

    if not book_details_after_update:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Book details not found"},
        )

    await db.commit()

async def get_book_details(book_details_id: int, db: AsyncSession):
    stmt =(
        select(Book)
        .where(Book.book_details.any(BookDetails.id == book_details_id))
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
            
        )
    )
    result = await db.execute(stmt)
    book = result.scalars().first()
    return book

def get_all_books(db: AsyncSession):
    stmt = (
        select(Book)
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
        )
    )
    result = db.execute(stmt)
    return result.scalars().all()

## this will be used to fetch books from the API and convert them into documents to be used in the vector database
def fetch_books_from_api(api_url="http://127.0.0.1:8000/api/books/"):
    try:
        response = requests.get(api_url, timeout=30)  # Increased timeout
        response.raise_for_status()  # Raises error for bad status codes
        books = response.json()  # List of book objects
        documents = []
        for book in books:
            # Extract status info from book_details
            status_info = ", ".join(
                f"{detail['status']} (Stock: {detail['available_stock']})"
                for detail in book["book_details"]
            )
            # Combine fields for embedding
            content = (
                f"Title: {book['title']}\n"
                f"Description: {book['description']}\n"
                f"Author: {book['author']['name']}\n"
                f"Category: {book['category']['name']}\n"
                f"Publish Year: {book['publish_year']}\n"
                f"Status: {status_info}"
            )
            # Metadata for filtering/display
            metadata = {
                "id": book["id"],  # Book ID for updates/deletes
                "title": book["title"],
                "author": book["author"]["name"],
                "category": book["category"]["name"],
                "publish_year": book["publish_year"]
            }
            doc = Document(page_content=content, metadata=metadata)
            documents.append(doc)
        return documents
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch books: {e}")