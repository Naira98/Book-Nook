from typing import List, Optional

from fastapi import HTTPException, status
from models.book import Author, Book, BookDetails, BookStatus, Category
from models.order import BorrowOrderBook, PurchaseOrderBook
from schemas.book import (
    BestSellerBookSchema,
    BookDetailsForUpdateResponse,
    BookResponse,
    BookTableSchema,
    CreateAuthorCategoryRequest,
    CreateBookRequest,
    SimpleBookSchema,
    UpdateBookData,
)
from sqlalchemy import func, insert, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, joinedload, selectinload
from utils.order import calculate_borrow_order_book_fees
from utils.settings import get_settings


async def get_borrow_books_crud(
    db,
    search: Optional[str] = None,
    authors_ids: Optional[str] = None,
    categories_ids: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    book_details_id: Optional[int] = None,
):
    # 1. Join with all necessary tables upfront
    base_query = (
        select(BookDetails)
        .where(BookDetails.status == BookStatus.BORROW)
        .join(BookDetails.book)
        .join(Book.author)
        .join(Book.category)
    )

    # 2. Apply filters based on optional arguments
    if book_details_id:
        base_query = base_query.where(BookDetails.id == book_details_id)

    if search:
        base_query = base_query.filter(
            Book.title.ilike(f"%{search}%"),
        )

    if authors_ids:
        # Split the string of IDs and convert to a list of integers
        author_ids_list = [int(id_str.strip()) for id_str in authors_ids.split(",")]
        # Filter by author ID
        base_query = base_query.where(Author.id.in_(author_ids_list))

    if categories_ids:
        # Split the string of IDs and convert to a list of integers
        category_ids_list = [
            int(id_str.strip()) for id_str in categories_ids.split(",")
        ]
        # Filter by category ID
        base_query = base_query.where(Category.id.in_(category_ids_list))

    # --- 3. Calculate pagination parameters and retrieve the data. ---

    # Get the total count of items that match the filters.
    count_query = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_query)).scalar()

    # Calculate offset for pagination
    offset = (page - 1) * limit

    # Construct the final query with eager loading, limit, and offset
    query = (
        base_query.options(
            selectinload(BookDetails.book).selectinload(Book.author),
            selectinload(BookDetails.book).selectinload(Book.category),
        )
        .limit(limit)
        .offset(offset)
    )

    books_for_borrowing = await db.execute(query)

    # Fetch settings for fee calculation
    settings = await get_settings(db)

    result_list = []
    for book_details in books_for_borrowing.scalars():
        # Calculate fees for each book
        fees = calculate_borrow_order_book_fees(
            book_price=book_details.book.price,
            borrowing_weeks=1,
            borrow_perc=settings.borrow_perc,
            deposit_perc=settings.deposit_perc,
            delay_perc=settings.delay_perc,
            min_borrow_fee=settings.min_borrow_fee,
            promo_code_perc=None,
        )

        book_info = {
            "book_details_id": book_details.id,
            "title": book_details.book.title,
            "description": book_details.book.description,
            "cover_img": book_details.book.cover_img,
            "publish_year": book_details.book.publish_year,
            "category": {
                "id": book_details.book.category.id,
                "name": book_details.book.category.name,
            },
            "author": {
                "id": book_details.book.author.id,
                "name": book_details.book.author.name,
            },
            "available_stock": book_details.available_stock,
            "book_id": book_details.book.id,
            "borrow_fees_per_week": fees["borrow_fees_per_week"],
            "deposit_fees": fees["deposit_fees"],
            "rating": str(book_details.book.rating),
        }
        result_list.append(book_info)

    # Return a dictionary with the list of books and pagination metadata
    return {
        "items": result_list,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit if total_count > 0 else 0,
    }


async def get_purchase_books_crud(
    db,
    search: Optional[str] = None,
    authors_ids: Optional[str] = None,
    categories_ids: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    book_details_id: Optional[int] = None,
):
    """
    Retrieves purchase books with pagination, search, and filters for authors and categories by their IDs.

    Args:
        db: The database session.
        search: Optional search query to filter by book title or author name.
        authors_ids: Comma-separated string of author IDs to filter by (e.g., "1, 2, 3").
        categories_ids: Comma-separated string of category IDs to filter by (e.g., "10, 11").
        page: The page number for pagination (starts from 1).
        limit: The maximum number of results per page.
        book_details_id: Optional ID of a specific book detail to retrieve.

    Returns:
        A dictionary containing the list of books and pagination metadata.
    """
    # 1. Join with all necessary tables upfront to ensure all fields are accessible for filtering
    #    and the final response schema.
    base_query = (
        select(BookDetails)
        .where(BookDetails.status == BookStatus.PURCHASE)
        .join(BookDetails.book)
        .join(Book.author)
        .join(Book.category)
    )

    # Apply specific book details ID filter if provided
    if book_details_id:
        base_query = base_query.where(BookDetails.id == book_details_id)

    # 2. If a search query is provided, filter the results with it.
    if search:
        base_query = base_query.filter(
            or_(Book.title.ilike(f"%{search}%"), Author.name.ilike(f"%{search}%"))
        )

    # 3. If author or category IDs are provided, include them in the conditions.
    if authors_ids:
        author_ids_list = [int(id_str.strip()) for id_str in authors_ids.split(",")]
        base_query = base_query.where(Author.id.in_(author_ids_list))

    if categories_ids:
        category_ids_list = [
            int(id_str.strip()) for id_str in categories_ids.split(",")
        ]
        base_query = base_query.where(Category.id.in_(category_ids_list))

    # --- Step 4: Calculate pagination parameters and retrieve the data. ---

    # Get the total count of items that match the filters.
    count_query = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_query)).scalar()

    # Calculate offset for pagination
    offset = (page - 1) * limit

    # Construct the final query with eager loading, limit, and offset
    query = (
        base_query.options(
            selectinload(BookDetails.book).selectinload(Book.author),
            selectinload(BookDetails.book).selectinload(Book.category),
        )
        .limit(limit)
        .offset(offset)
    )

    books_for_purchase = await db.execute(query)

    return_list = []
    for book_details in books_for_purchase.scalars():
        # Map the ORM object to the required response schema
        book_info = {
            "book_details_id": book_details.id,
            "title": book_details.book.title,
            "description": book_details.book.description,
            "cover_img": book_details.book.cover_img,
            "publish_year": book_details.book.publish_year,
            "category": {
                "id": book_details.book.category.id,
                "name": book_details.book.category.name,
            },
            "author": {
                "id": book_details.book.author.id,
                "name": book_details.book.author.name,
            },
            "available_stock": book_details.available_stock,
            "book_id": book_details.book.id,
            "price": book_details.book.price,
            "rating": str(book_details.book.rating),
        }
        return_list.append(book_info)

    # Return a dictionary with the list of books and pagination metadata
    return {
        "items": return_list,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit if total_count > 0 else 0,
    }


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
                price=book.price,
                author_name=book.author.name,
                category_name=book.category.name,
                available_stock_purchase=purchase_stock,
                available_stock_borrow=borrow_stock,
            )
        )
    return book_table_data


async def update_book_crud(book_id: int, book_data: UpdateBookData, db: AsyncSession):
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

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update book: {e}")

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


def get_all_books_sync(db: Session):
    stmt = select(Book).options(
        selectinload(Book.author),
        selectinload(Book.category),
    )
    result = db.execute(stmt)
    return result.scalars().all()


async def get_top_borrow_books(
    db: AsyncSession, limit: int = 8
) -> List[BestSellerBookSchema]:
    try:
        query = (
            select(
                Book.id,
                BookDetails.id.label("book_details_id"),
                Book.title,
                Book.price,
                Book.cover_img,
                Book.publish_year,
                Book.rating,
                Author.name.label("author_name"),
                Category.name.label("category_name"),
                func.count(BorrowOrderBook.id).label("borrow_count"),
            )
            .join(BookDetails, BookDetails.book_id == Book.id)
            .join(BorrowOrderBook, BorrowOrderBook.book_details_id == BookDetails.id)
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .where(BookDetails.status == "BORROW")
            .group_by(Book.id, BookDetails.id, Author.name, Category.name)
            .order_by(func.count(BorrowOrderBook.id).desc())
            .limit(limit)
        )

        result = await db.execute(query)
        results = result.all()

        bestseller_books = [
            BestSellerBookSchema(
                book=SimpleBookSchema(
                    id=row[0],
                    book_details_id=row[1],
                    title=row[2],
                    price=row[3],
                    cover_img=row[4],
                    publish_year=row[5],
                    rating=row[6],
                    author_name=row[7],
                    category_name=row[8],
                ),
                total_count=row[9],
            )
            for row in results
        ]

        # If we don't have enough books, get random books to fill the gap
        if len(bestseller_books) < limit:
            missing_count = limit - len(bestseller_books)
            random_books = await get_random_borrow_books(
                db, missing_count, [book.book.id for book in bestseller_books]
            )
            bestseller_books.extend(random_books)

        return bestseller_books

    except Exception as e:
        print(f"Error fetching top borrow books: {str(e)}")
        # Ensure we always return a list, even on error
        return await get_random_borrow_books(db, limit)


async def get_top_purchase_books(
    db: AsyncSession, limit: int = 8
) -> List[BestSellerBookSchema]:
    try:
        query = (
            select(
                Book.id,
                BookDetails.id.label("book_details_id"),
                Book.title,
                Book.price,
                Book.cover_img,
                Book.publish_year,
                Book.rating,
                Author.name.label("author_name"),
                Category.name.label("category_name"),
                func.sum(PurchaseOrderBook.quantity).label("purchase_count"),
            )
            .join(BookDetails, BookDetails.book_id == Book.id)
            .join(
                PurchaseOrderBook, PurchaseOrderBook.book_details_id == BookDetails.id
            )
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .where(BookDetails.status == "PURCHASE")
            .group_by(Book.id, BookDetails.id, Author.name, Category.name)
            .order_by(func.sum(PurchaseOrderBook.quantity).desc())
            .limit(limit)
        )

        result = await db.execute(query)
        results = result.all()

        bestseller_books = [
            BestSellerBookSchema(
                book=SimpleBookSchema(
                    id=row[0],
                    book_details_id=row[1],
                    title=row[2],
                    price=row[3],
                    cover_img=row[4],
                    publish_year=row[5],
                    rating=row[6],
                    author_name=row[7],
                    category_name=row[8],
                ),
                total_count=int(row[9] or 0),
            )
            for row in results
        ]

        # If we don't have enough books, get random books to fill the gap
        if len(bestseller_books) < limit:
            missing_count = limit - len(bestseller_books)
            random_books = await get_random_purchase_books(
                db, missing_count, [book.book.id for book in bestseller_books]
            )
            bestseller_books.extend(random_books)

        return bestseller_books

    except Exception as e:
        print(f"Error fetching top purchase books: {str(e)}")
        # Ensure we always return a list, even on error
        return await get_random_purchase_books(db, limit)


async def get_random_borrow_books(
    db: AsyncSession, limit: int, exclude_book_ids: Optional[List[int]] = None
) -> List[BestSellerBookSchema]:
    """Get random books that are available for borrowing"""
    try:
        query = (
            select(
                Book.id,
                BookDetails.id.label("book_details_id"),
                Book.title,
                Book.price,
                Book.cover_img,
                Book.publish_year,
                Book.rating,
                Author.name.label("author_name"),
                Category.name.label("category_name"),
            )
            .join(BookDetails, BookDetails.book_id == Book.id)
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .where(BookDetails.status == "BORROW")
        )

        if exclude_book_ids:
            query = query.where(Book.id.notin_(exclude_book_ids))

        query = query.order_by(func.random()).limit(limit)

        result = await db.execute(query)
        results = result.all()

        return [
            BestSellerBookSchema(
                book=SimpleBookSchema(
                    id=row[0],
                    book_details_id=row[1],
                    title=row[2],
                    price=row[3],
                    cover_img=row[4],
                    publish_year=row[5],
                    rating=row[6],
                    author_name=row[7],
                    category_name=row[8],
                ),
                total_count=0,
            )
            for row in results
        ]

    except Exception as e:
        print(f"Error fetching random borrow books: {str(e)}")
        # Return empty list instead of None
        return []


async def get_random_purchase_books(
    db: AsyncSession, limit: int, exclude_book_ids: Optional[List[int]] = None
) -> List[BestSellerBookSchema]:
    """Get random books that are available for purchase"""
    try:
        query = (
            select(
                Book.id,
                BookDetails.id.label("book_details_id"),
                Book.title,
                Book.price,
                Book.cover_img,
                Book.publish_year,
                Book.rating,
                Author.name.label("author_name"),
                Category.name.label("category_name"),
            )
            .join(BookDetails, BookDetails.book_id == Book.id)
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .where(BookDetails.status == "PURCHASE")
        )

        if exclude_book_ids:
            query = query.where(Book.id.notin_(exclude_book_ids))

        query = query.order_by(func.random()).limit(limit)

        result = await db.execute(query)
        results = result.all()

        return [
            BestSellerBookSchema(
                book=SimpleBookSchema(
                    id=row[0],
                    book_details_id=row[1],
                    title=row[2],
                    price=row[3],
                    cover_img=row[4],
                    publish_year=row[5],
                    rating=row[6],
                    author_name=row[7],
                    category_name=row[8],
                ),
                total_count=0,
            )
            for row in results
        ]

    except Exception as e:
        print(f"Error fetching random purchase books: {str(e)}")
        # Return empty list instead of None
        return []


async def get_any_books_as_fallback(
    db: AsyncSession, limit: int, book_type: str
) -> List[BestSellerBookSchema]:
    """Fallback to get any books when no specific type is available"""
    try:
        query = (
            select(
                Book.id,
                BookDetails.id.label("book_details_id"),
                Book.title,
                Book.price,
                Book.cover_img,
                Book.publish_year,
                Book.rating,
                Author.name.label("author_name"),
                Category.name.label("category_name"),
            )
            .join(BookDetails, BookDetails.book_id == Book.id)
            .join(Author, Book.author_id == Author.id)
            .join(Category, Book.category_id == Category.id)
            .order_by(func.random())
            .limit(limit)
        )

        result = await db.execute(query)
        results = result.all()

        return [
            BestSellerBookSchema(
                book=SimpleBookSchema(
                    id=row[0],
                    book_details_id=row[1],
                    title=row[2],
                    price=row[3],
                    cover_img=row[4],
                    publish_year=row[5],
                    rating=row[6],
                    author_name=row[7],
                    category_name=row[8],
                ),
                total_count=0,
            )
            for row in results
        ]

    except Exception as e:
        print(f"Error in fallback for {book_type} books: {str(e)}")
        # Return empty list instead of None
        return []
