from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from models.book import Author, Book, BookDetails, BookStatus, Category
from schemas.book import (
    BookDetailsForUpdateResponse,
    BookTableSchema,
    CreateAuthorCategoryRequest,
    CreateBookRequest,
    UpdateBookData,
    BookResponse,
)
from sqlalchemy import insert, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager, joinedload, selectinload


async def get_authors_crud(db):
    result = await db.execute(select(Author))
    authors = result.scalars().all()
    return authors


async def get_author_by_id(db, author_id: int):
    stmt = select(Author).where(Author.id == author_id)
    result = await db.execute(stmt)
    author = result.scalars().first()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Author not found"},
        )
    return author


async def create_author_crud(
    db: AsyncSession, author_data: CreateAuthorCategoryRequest
):
    stmt = select(Author).where(Author.name == author_data.name)
    result = await db.execute(stmt)
    existing_author = result.scalar_one_or_none()

    if existing_author:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An author with this name already exists.",
        )

    try:
        new_author = Author(name=author_data.name)
        db.add(new_author)
        await db.commit()
        await db.refresh(new_author)
        return new_author
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create author due to a database integrity error.",
        )


async def get_categories_crud(db):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories


async def get_category_by_id(db, category_id: int):
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalars().first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Category not found"},
        )
    return category


async def create_category_crud(
    db: AsyncSession, category_data: CreateAuthorCategoryRequest
):
    stmt = select(Category).where(Category.name == category_data.name)
    result = await db.execute(stmt)
    existing_category = result.scalar_one_or_none()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A category with this name already exists.",
        )

    try:
        new_category = Category(name=category_data.name)
        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)
        return new_category
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create category due to a database integrity error.",
        )


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
    books = result.scalars().all()
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
            contains_eager(Book.book_details),
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


async def get_book_details_for_update_crud(db: AsyncSession, book_id: int):
    result = await db.execute(
        select(Book).options(selectinload(Book.book_details)).filter(Book.id == book_id)
    )
    book = result.scalars().first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return BookDetailsForUpdateResponse.from_orm(book)


async def create_book(book_data: CreateBookRequest, db: AsyncSession):
    try:
        book_to_create = Book(
            **book_data.model_dump(),
        )
        db.add(book_to_create)
        await db.flush()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": f"Failed to create book: {str(e)}"},
        )
    return book_to_create


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
    purchase_available_stock: int,
    borrow_available_stock: int,
    db: AsyncSession,
):
    rows_to_insert = []

    if purchase_available_stock >= 0:
        rows_to_insert.append(
            {
                "book_id": book_id,
                "status": BookStatus.PURCHASE.value,
                "available_stock": purchase_available_stock,
            }
        )

    if borrow_available_stock >= 0:
        rows_to_insert.append(
            {
                "book_id": book_id,
                "status": BookStatus.BORROW.value,
                "available_stock": borrow_available_stock,
            }
        )

    try:
        if rows_to_insert:
            stmt = insert(BookDetails).values(rows_to_insert)
            await db.execute(stmt)
            await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": f"Failed to create book details due to an error: {e}",
                "rows_to_insert": rows_to_insert,
            },
        )



""" Employee-only endpoints for book management """


async def get_books_table_crud(db):
    result = await db.execute(
        select(Book).options(
            joinedload(Book.author),
            joinedload(Book.category),
            selectinload(Book.book_details),
        )
    )
    books = result.scalars().all()

    book_table_data = []
    for book in books:
        purchase_stock = next(
            (
                book_details.available_stock
                for book_details in book.book_details
                if book_details.status == BookStatus.PURCHASE
            ),
            0,
        )
        borrow_stock = next(
            (
                bd.available_stock
                for bd in book.book_details
                if bd.status == BookStatus.BORROW
            ),
            0,
        )
        book_table_data.append(
            BookTableSchema(
                id=book.id,
                title=book.title,
                price=f"{book.price:.2f}",
                author_name=book.author.name,
                category_name=book.category.name,
                available_stock_purchase=purchase_stock,
                available_stock_borrow=borrow_stock,
            )
        )
    return book_table_data


async def update_book_and_stock(
    book_id: int, book_data: UpdateBookData, db: AsyncSession
):
    update_data = book_data.model_dump(exclude_unset=True)

    purchase_stock_update = update_data.pop("purchase_available_stock", None)
    borrow_stock_update = update_data.pop("borrow_available_stock", None)

    if update_data:
        book_update_stmt = update(Book).where(Book.id == book_id).values(**update_data)
        await db.execute(book_update_stmt)

    if purchase_stock_update is not None:
        purchase_stock_stmt = (
            update(BookDetails)
            .where(BookDetails.book_id == book_id, BookDetails.status == "PURCHASE")
            .values(available_stock=purchase_stock_update)
        )
        await db.execute(purchase_stock_stmt)

    if borrow_stock_update is not None:
        borrow_stock_stmt = (
            update(BookDetails)
            .where(BookDetails.book_id == book_id, BookDetails.status == "BORROW")
            .values(available_stock=borrow_stock_update)
        )
        await db.execute(borrow_stock_stmt)

    # Corrected Indentation: This block should be outside the 'if' statements
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update book: {e}")

    # Eagerly load the 'author', 'category', and 'book_details' relationships
    book_query = (
        select(Book)
        .where(Book.id == book_id)
        .options(
            selectinload(Book.author),
            selectinload(Book.category),
            selectinload(Book.book_details),
        )
    )

    result = await db.execute(book_query)
    updated_book = result.scalars().first()

    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found after update.")

    return BookResponse.model_validate(updated_book)
