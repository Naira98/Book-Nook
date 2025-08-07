from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

from fastapi import HTTPException, status
from models.settings import PromoCode
from sqlalchemy import select
from models.book import BookStatus
from models.order import PickUpType


async def get_promo_code_discount_perc(cart, db):
    promo_code_discount_perc = None

    # Check for and validate promo code if an ID is provided
    if cart.promo_code_id:
        promo_code_result = await db.execute(
            select(PromoCode).where(PromoCode.id == cart.promo_code_id)
        )
        promo_code = promo_code_result.scalar_one_or_none()

        if not promo_code or not promo_code.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or inactive promo code.",
            )

        promo_code_discount_perc = promo_code.discount_perc
    return promo_code_discount_perc


def validate_borrowing_limit(cart, user, max_num_of_borrow_books):
    borrowing_book_count = len(cart.borrow_books)
    if borrowing_book_count + user.current_borrowed_books > max_num_of_borrow_books:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot borrow more than {max_num_of_borrow_books} books at once.",
        )


def calculate_borrow_order_book_fees(
    book_price: Decimal,
    borrowing_weeks: int,
    borrow_perc: Decimal,
    deposit_perc: Decimal,
    delay_perc: Decimal,  # Percentage to add ON TOP of the daily borrow cost
    min_borrow_fee: Decimal,  # Minimum weekly borrow fee
    promo_code_perc: Optional[Decimal] = None,
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
    promo_code_discount = Decimal(0)

    if promo_code_perc is not None:
        promo_code_discount = original_borrowing_fees * (promo_code_perc / 100)
        borrow_fees = original_borrowing_fees - promo_code_discount

    return {
        "borrow_fees": borrow_fees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "deposit_fees": deposit_fees.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
        "delay_fees_per_day": delay_fees_per_day.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "promo_code_discount": promo_code_discount.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }


def calculate_purchase_order_book_fees(
    book_price: Decimal, promo_code_perc: Optional[Decimal] = None
):
    promo_code_discount_per_book = Decimal(0)
    paid_price_per_book = book_price

    if promo_code_perc is not None:
        promo_code_discount_per_book = book_price * (promo_code_perc / 100)
        paid_price_per_book = book_price - promo_code_discount_per_book

    return {
        "paid_price_per_book": paid_price_per_book.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "promo_code_discount_per_book": promo_code_discount_per_book.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }


def get_delivery_fees(cart, settings_delivery_fees):
    delivery_fees = None

    if cart.pick_up_type == PickUpType.COURIER:
        delivery_fees = settings_delivery_fees

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
