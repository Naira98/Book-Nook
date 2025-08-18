from fastapi import HTTPException, status
from models.book import BookDetails, BookStatus
from models.cart import Cart
from models.user import User
from schemas.cart import CreateCartItemRequest
from schemas.order import UserCart
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload


async def validate_book_details(
    db: AsyncSession, cart_item_data: CreateCartItemRequest
):
    book_details = await db.get(BookDetails, cart_item_data.book_details_id)
    if not book_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book details not found"
        )
    if book_details.status.value == "BORROW" and cart_item_data.borrowing_weeks is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Borrowing weeks are required for borrowable books.",
        )
    elif book_details.status.value == "PURCHASE" and cart_item_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0 for purchaseable books.",
        )
    return book_details


async def validate_borrowing_limit(
    db: AsyncSession, user: User, max_num_of_borrow_books: int
):
    cart_borrowed_books_number = await db.execute(
        select(func.sum(Cart.quantity)).where(
            Cart.user_id == user.id, Cart.book_details.has(status=BookStatus.BORROW)
        )
    )
    cart_borrowed_books_number = cart_borrowed_books_number.scalar()
    if cart_borrowed_books_number is None:
        cart_borrowed_books_number = 0

    if (
        user.current_borrowed_books + cart_borrowed_books_number
        > max_num_of_borrow_books
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot borrow more than {max_num_of_borrow_books} books at once.",
        )


def validate_create_purchase_cart_item(
    book_details: BookDetails, item: CreateCartItemRequest
):
    # Validate stock for the purchase quantity
    if item.quantity <= 0 or item.quantity > book_details.available_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid quantity or not enough stock for book with id {book_details.id}.",
        )


def validate_create_borrow_cart_item(
    db: AsyncSession, book_details: BookDetails, item: CreateCartItemRequest
):
    # Validate borrowing weeks and stock
    # Assuming borrowing_weeks is an integer between 1 and 4
    if item.borrowing_weeks and not (1 <= item.borrowing_weeks <= 4):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Borrowing weeks must be between 1 and 4.",
        )
    if book_details.available_stock < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book with id {book_details.id} is out of stock.",
        )


def validate_update_cart_item(
    db: AsyncSession,
    cart_item: Cart,
    quantity: int | None,
    borrowing_weeks: int | None,
):
    if cart_item.book_details.status.value == "BORROW":
        if borrowing_weeks is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Borrowing weeks are required for borrowable books.",
            )
        if borrowing_weeks is not None and not (1 <= borrowing_weeks <= 4):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Borrowing weeks must be between 1 and 4.",
            )
    elif cart_item.book_details.status.value == "PURCHASE":
        if quantity is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than 0 for purchaseable books.",
            )
        if (
            quantity is not None
            and quantity <= 0
            or quantity > cart_item.book_details.available_stock
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid quantity or not enough stock for book with id {cart_item.book_details.id}.",
            )


async def get_user_cart(user_id: int, db: AsyncSession) -> UserCart:
    stmt = (
        select(Cart)
        .options(joinedload(Cart.book_details))
        .filter(Cart.user_id == user_id)
    )
    result = await db.execute(stmt)
    cart_items = result.scalars().unique().all()

    borrow_books = []
    purchase_books = []

    for item in cart_items:
        if item.book_details.status == BookStatus.BORROW:
            borrow_books.append(
                {
                    "book_details_id": item.book_details_id,
                    "borrowing_weeks": item.borrowing_weeks,
                }
            )
        elif item.book_details.status == BookStatus.PURCHASE:
            purchase_books.append(
                {"book_details_id": item.book_details_id, "quantity": item.quantity}
            )

    return {"borrow_books": borrow_books, "purchase_books": purchase_books}
