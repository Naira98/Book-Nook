from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

from fastapi import HTTPException, status
from models.settings import PromoCode
from sqlalchemy import select
from models.book import BookStatus
from models.order import PickUpType


async def get_promocode_discount_perc(cart, db):
    promocode_discount_perc = None

    # Check for and validate promo code if an ID is provided
    if cart.promocode_id:
        promocode_result = await db.execute(
            select(PromoCode).where(PromoCode.id == cart.promocode_id)
        )
        promocode = promocode_result.scalar_one_or_none()

        if not promocode or not promocode.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or inactive promo code.",
            )

        promocode_discount_perc = promocode.discount_perc
    return promocode_discount_perc


def validate_borrowing_limit(cart, user, settings):
    borrowing_book_count = len(cart.borrow_books)
    if (
        borrowing_book_count + user.current_borrowed_books
        > settings.max_num_of_borrow_books
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot borrow more than {settings.max_num_of_borrow_books} books at once.",
        )


def calculate_borrow_order_book_fees(
    book_price: Decimal,
    borrowing_weeks: int,
    borrow_perc: Decimal,
    deposit_perc: Decimal,
    delay_perc: Decimal,  # Percentage to add ON TOP of the daily borrow cost
    min_borrow_fee: Decimal,  # Minimum weekly borrow fee
    promocode_perc: Optional[Decimal] = None,
):
    # Calculate a base borrowing fee per week (either percentage-based or minimum flat fee)
    fee_from_percentage = book_price * (borrow_perc / 100)
    base_borrow_fee_per_week = max(fee_from_percentage, min_borrow_fee)

    original_borrowing_fees = base_borrow_fee_per_week * Decimal(borrowing_weeks)

    deposit_fees = book_price * (deposit_perc / 100)

    daily_equivalent_borrow_fee = base_borrow_fee_per_week / Decimal(7)
    daily_delay_amount = daily_equivalent_borrow_fee * (delay_perc / 100)
    delay_fees_per_day = daily_equivalent_borrow_fee + daily_delay_amount

    borrow_fees = original_borrowing_fees
    promocode_discount = Decimal(0)

    if promocode_perc is not None:
        promocode_discount = original_borrowing_fees * (promocode_perc / 100)
        borrow_fees = original_borrowing_fees - promocode_discount

    return {
        "book_price": book_price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "borrowing_weeks": Decimal(borrowing_weeks),
        "borrow_fees": borrow_fees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "deposit_fees": deposit_fees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "delay_fees_per_day": delay_fees_per_day.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "promocode_discount": promocode_discount.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }


def calculate_purchase_order_book_fees(
    book_price: Decimal, quantity: int, promocode_perc: Optional[Decimal] = None
):
    original_total_price = book_price * Decimal(quantity)

    promocode_discount = Decimal(0)
    promocode_discount_per_book = Decimal(0)
    paid_price_per_book = book_price

    if promocode_perc is not None:
        promocode_discount = original_total_price * (promocode_perc / 100)
        promocode_discount_per_book = promocode_discount / Decimal(quantity)
        paid_price_per_book = book_price - promocode_discount_per_book

    return {
        "paid_price_per_book": paid_price_per_book.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "promocode_discount_per_book": promocode_discount_per_book.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }


def get_delivery_fees(cart, settings):
    delivery_fees = None

    if cart.pick_up_type == PickUpType.COURIER:
        delivery_fees = settings.delivery_fees

    return delivery_fees


def validate_purchase_book_and_available_stock(item, book_details):
    # Validate that the book is for purchase
    if book_details.status != BookStatus.PURCHASE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book with id {book_details.id} is not available for purchase.",
        )

        # Validate stock for the purchase quantity
    if item.quantity <= 0 or item.quantity > book_details.available_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid quantity or not enough stock for book with id {book_details.id}.",
        )


def validate_borrow_book_and_borrowing_weeks_and_available_stock(item, book_details):
    # Validate that the book is for borrowing
    if book_details.status != BookStatus.BORROW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book with id {book_details.id} is not available for borrowing.",
        )

        # Validate borrowing weeks and stock
        # Assuming borrowing_weeks is an integer between 1 and 4
    if not (1 <= item.borrowing_weeks <= 4):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Borrowing weeks must be between 1 and 4.",
        )
    if book_details.available_stock < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book with id {book_details.id} is out of stock.",
        )
