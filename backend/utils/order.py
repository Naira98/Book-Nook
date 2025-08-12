from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

from fastapi import HTTPException, status
from models.settings import PromoCode
from sqlalchemy import select
from models.book import BookStatus
from models.order import PickUpType, ReturnOrder
from models.user import User
from schemas.order import UpdateReturnOrderStatusRequest, ReturnOrderStatus


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


def validate_borrowing_limit(user, max_num_of_borrow_books, borrowing_book_count):
    if borrowing_book_count + user.current_borrowed_books > max_num_of_borrow_books:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot borrow more than {max_num_of_borrow_books} books at once.",
        )
    return borrowing_book_count


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
        "boorow_fees_per_week": base_borrow_fee_per_week,
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


def validate_borrowed_books(return_order_data, db_borrowed_books_ids):
    for book_id in return_order_data.borrowed_books_ids:
        if book_id not in db_borrowed_books_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book with ID {book_id} is not currently borrowed by you.",
            )


def Validate_return_order_for_courier(
    return_order_data: UpdateReturnOrderStatusRequest,
    db_return_order: ReturnOrder,
    user: User,
):
    allowed_statuses = [
        ReturnOrderStatus.ON_THE_WAY,
        ReturnOrderStatus.PICKED_UP,
        ReturnOrderStatus.PROBLEM,
    ]

    if return_order_data.pick_up_type != PickUpType.COURIER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return order pick up type is not courier.",
        )

    if return_order_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid return order status. Allowed statuses are: {allowed_statuses}",
        )

    if (
        return_order_data.status == ReturnOrderStatus.ON_THE_WAY
        and db_return_order.status != ReturnOrderStatus.CREATED
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return order status must be CREATED to be set to ON_THE_WAY.",
        )

    if return_order_data.status == ReturnOrderStatus.PICKED_UP:
        if db_return_order.courier_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this return order's status.",
            )
        if db_return_order.status != ReturnOrderStatus.ON_THE_WAY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return order status must be ON_THE_WAY to be set to PICKED_UP.",
            )
    if (
        return_order_data.status == ReturnOrderStatus.PROBLEM
        and db_return_order.status != ReturnOrderStatus.ON_THE_WAY
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return order status must be ON_THE_WAY to be set to PROBLEM.",
        )


def Validate_return_order_for_employee(
    return_order_data: UpdateReturnOrderStatusRequest,
    db_return_order: ReturnOrder,
    user: User,
):
    allowed_statuses = [
        ReturnOrderStatus.CHECKING,
        ReturnOrderStatus.DONE,
        ReturnOrderStatus.PROBLEM,
    ]

    if return_order_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid return order status. Allowed statuses are: {allowed_statuses}",
        )

    if return_order_data.status == ReturnOrderStatus.CHECKING:
        if (
            db_return_order.status != ReturnOrderStatus.PICKED_UP
            and db_return_order.pick_up_type == PickUpType.COURIER
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return order status must be PICKED_UP to be set to CHECKING.",
            )

        if (
            db_return_order.status != ReturnOrderStatus.CREATED
            and db_return_order.pick_up_type == PickUpType.SITE
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return order status must be CREATED to be set to CHECKING.",
            )

    elif return_order_data.status == ReturnOrderStatus.DONE:
        if db_return_order.status != ReturnOrderStatus.CHECKING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Return order status must be CHECKING to be set to DONE.",
            )

        if return_order_data.borrow_order_books_details is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="borrow_order_books_details must be provided when status is DONE.",
            )

        if len(return_order_data.borrow_order_books_details) != len(
            db_return_order.borrow_order_books_details
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some borrowed books are missing from the request.",
            )
