from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload, contains_eager
from fastapi.responses import JSONResponse
from models.book import Book, BookDetails, BookStatus
from schemas.book import CreateBookRequest
from fastapi import status


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
        await db.commit()
        await db.refresh(book_to_create)
    except Exception:
        await db.rollback()
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Failed to create book"},
        )
    return book_to_create
