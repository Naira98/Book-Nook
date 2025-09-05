from datetime import datetime
from decimal import Decimal
from typing import Annotated, List, Optional

from core.cloudinary import upload_image
from crud.book import (
    create_author_crud,
    create_book,
    create_book_details,
    create_category_crud,
    get_any_books_as_fallback,
    get_author_by_id,
    get_authors_crud,
    get_book_details_for_update_crud,
    get_books_table_crud,
    get_borrow_books_crud,
    get_categories_crud,
    get_category_by_id,
    get_purchase_books_crud,
    get_top_borrow_books,
    get_top_purchase_books,
    is_book_exists,
    update_book_crud,
)
from crud.settings import get_settings_crud
from db.database import get_db
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import JSONResponse
from models.user_tracker import UserTracker
from schemas.book import (
    AuthorCategorySchema,
    BestSellersResponse,
    BookDetailsForUpdateResponse,
    BookResponse,
    BookTableSchema,
    BorrowBookResponse,
    CreateAuthorCategoryRequest,
    CreateBookRequest,
    PaginatedBorrowBooksResponse,
    PaginatedPurchaseBooksResponse,
    PurchaseBookResponse,
    UpdateBookData,
)
from schemas.manager import SettingsResponse
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_staff_user, get_user_id_via_session

book_router = APIRouter(prefix="/books", tags=["Books"])


@book_router.get("/borrow", response_model=PaginatedBorrowBooksResponse)
async def get_borrow_books(
    db: AsyncSession = Depends(get_db),
    # Optional parameters for filtering and searching
    search: Optional[str] = Query(
        None, description="Search by book title or author name."
    ),
    authors_ids: Optional[str] = Query(
        None, description="Filter by comma-separated author names."
    ),
    categories_ids: Optional[str] = Query(
        None, description="Filter by comma-separated category names."
    ),
    # Optional parameter for retrieving a single book by ID
    book_details_id: Optional[int] = Query(
        None, description="ID of a specific book detail to retrieve."
    ),
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page."),
    _=Depends(get_user_id_via_session),
):
    """
    Retrieves a paginated list of books available for borrowing, with optional
    search and filtering by author and category.
    """
    return await get_borrow_books_crud(
        db,
        search=search,
        authors_ids=authors_ids,
        categories_ids=categories_ids,
        page=page,
        limit=limit,
        book_details_id=book_details_id,
    )


@book_router.get("/borrow/{book_details_id}", response_model=BorrowBookResponse)
async def get_borrow_book_details(
    book_details_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_user_id_via_session),
):
    book_details = await get_borrow_books_crud(db, book_details_id=book_details_id)
    if not len(book_details["items"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    book_details_data = book_details["items"][0]
    user_tracker = UserTracker(
        category=book_details_data["category"]["name"],
        user_id=user_id,
        book_id=book_details_data["book_id"],
    )
    db.add(user_tracker)
    await db.commit()

    return book_details_data


@book_router.get("/purchase", response_model=PaginatedPurchaseBooksResponse)
async def get_purchase_books(
    db: AsyncSession = Depends(get_db),
    # Optional parameters for filtering and searching
    search: Optional[str] = Query(
        None, description="Search by book title or author name."
    ),
    authors_ids: Optional[str] = Query(
        None, description="Filter by comma-separated author names."
    ),
    categories_ids: Optional[str] = Query(
        None, description="Filter by comma-separated category names."
    ),
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number."),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page."),
    _=Depends(get_user_id_via_session),
):
    """
    Retrieves a paginated list of books available for purchase, with optional
    search and filtering by author and category.
    """
    return await get_purchase_books_crud(
        db,
        search=search,
        authors_ids=authors_ids,
        categories_ids=categories_ids,
        page=page,
        limit=limit,
    )


@book_router.get("/purchase/{book_details_id}", response_model=PurchaseBookResponse)
async def get_purchase_book_details(
    book_details_id: int,
    db: AsyncSession = Depends(get_db),
    user_id=Depends(get_user_id_via_session),
):
    book_details = await get_purchase_books_crud(db, book_details_id=book_details_id)
    if not len(book_details["items"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    book_details_data = book_details["items"][0]
    user_tracker = UserTracker(
        category=book_details_data["category"]["name"],
        user_id=user_id,
        book_id=book_details_data["book_id"],
    )
    db.add(user_tracker)
    await db.commit()

    return book_details_data


@book_router.get("/authors", response_model=List[AuthorCategorySchema])
async def get_authors(
    db: AsyncSession = Depends(get_db), _=Depends(get_user_id_via_session)
):
    return await get_authors_crud(db)


@book_router.get("/categories", response_model=List[AuthorCategorySchema])
async def get_categories(
    db: AsyncSession = Depends(get_db), _=Depends(get_user_id_via_session)
):
    return await get_categories_crud(db)


@book_router.get("/bestsellers", response_model=BestSellersResponse)
async def get_best_sellers(
    limit: int = 8,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_user_id_via_session),
):
    borrow_books = await get_top_borrow_books(db, limit)
    purchase_books = await get_top_purchase_books(db, limit)

    # Final fallback - if still empty, get any books
    if not borrow_books:
        borrow_books = await get_any_books_as_fallback(db, limit, "borrow")
    if not purchase_books:
        purchase_books = await get_any_books_as_fallback(db, limit, "purchase")

    return BestSellersResponse(
        borrow_books=borrow_books,
        purchase_books=purchase_books,
        last_updated=datetime.now(),
    )


""" Staff-only routers"""


@book_router.post(
    "/authors",
    status_code=status.HTTP_201_CREATED,
    response_model=AuthorCategorySchema,
)
async def create_author(
    author: CreateAuthorCategoryRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_staff_user),
):
    return await create_author_crud(db, author)


@book_router.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
    response_model=AuthorCategorySchema,
)
async def create_category(
    category: CreateAuthorCategoryRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_staff_user),
):
    return await create_category_crud(db, category)


@book_router.get("/table", response_model=List[BookTableSchema])
async def get_books_table(
    db: AsyncSession = Depends(get_db), _=Depends(get_staff_user)
):
    return await get_books_table_crud(db)


@book_router.get(
    "/update_details/{book_id}", response_model=BookDetailsForUpdateResponse
)
async def get_book_details_for_update(
    book_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_staff_user)
):
    return await get_book_details_for_update_crud(db, book_id=book_id)


@book_router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=BookTableSchema
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
    img_file: Annotated[UploadFile, File()],
    db: AsyncSession = Depends(get_db),
    _=Depends(get_staff_user),
):
    if await is_book_exists(db, title, author_id):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Book with this title and author already exists."},
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
        price=book.price,
        author_name=author.name,
        category_name=category.name,
        available_stock_purchase=purchase_available_stock,
        available_stock_borrow=borrow_available_stock,
    )


@book_router.patch("/{book_id}", response_model=BookResponse, status_code=200)
async def update_book(
    book_id: int,
    title: Annotated[str, Form()],
    price: Annotated[str, Form()],
    description: Annotated[str, Form()],
    category_id: Annotated[int, Form()],
    author_id: Annotated[int, Form()],
    publish_year: Annotated[int, Form()],
    purchase_available_stock: Annotated[int, Form()],
    borrow_available_stock: Annotated[int, Form()],
    img_file: Annotated[Optional[UploadFile], File()] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_staff_user),
):
    secure_url = None
    if img_file:
        secure_url = await upload_image(img_file)

    book_data_dict = {
        "title": title,
        "price": price,
        "description": description,
        "category_id": category_id,
        "author_id": author_id,
        "publish_year": publish_year,
        "purchase_available_stock": purchase_available_stock,
        "borrow_available_stock": borrow_available_stock,
    }
    if secure_url:
        book_data_dict["cover_img"] = secure_url

    book_data = UpdateBookData(**book_data_dict)

    return await update_book_crud(book_id, book_data, db)


@book_router.get(
    "/settings",
    response_model=SettingsResponse,
)
async def get_settings(
    _=Depends(get_user_id_via_session), db: AsyncSession = Depends(get_db)
):
    return await get_settings_crud(db)
