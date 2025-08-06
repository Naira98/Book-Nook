from decimal import Decimal
from typing import Annotated, List

from db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models.book import BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    OrderStatus,
    PurchaseOrderBook,
)
from models.user import User
from schemas.order import CreateOrderRequest, OrderCreatedResponse, OrderResponseSchema
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.auth import get_user
from utils.order import (
    calculate_borrow_order_book_fees,
    calculate_purchase_order_book_fees,
    get_delivery_fees,
    get_promocode_discount_perc,
    validate_borrow_book_and_borrowing_weeks_and_available_stock,
    validate_borrowing_limit,
    validate_purchase_book_and_available_stock,
)
from utils.settings import get_settings
from utils.wallet import pay_from_wallet

order_router = APIRouter(
    prefix="/order",
    tags=["Orders"],
)


@order_router.get(
    "/", response_model=List[OrderResponseSchema], status_code=status.HTTP_200_OK
)
async def get_orders(
    user: Annotated[User, Depends(get_user)], db: AsyncSession = Depends(get_db)
):
    query = (
        select(Order)
        .where(Order.user_id == user.id)
        .options(
            selectinload(Order.borrow_order_books_details).options(
                joinedload(BorrowOrderBook.book_details).options(
                    joinedload(BookDetails.book)
                ),
                joinedload(BorrowOrderBook.return_order),
            ),
            selectinload(Order.purchase_order_books_details).options(
                joinedload(PurchaseOrderBook.book_details).options(
                    joinedload(BookDetails.book)
                )
            ),
        )
        .order_by(Order.created_at.desc())
    )

    result = await db.execute(query)
    orders = result.scalars().unique().all()
    return orders


@order_router.post(
    "/", response_model=OrderCreatedResponse, status_code=status.HTTP_201_CREATED
)
async def create_order(
    cart: CreateOrderRequest,
    user: Annotated[User, Depends(get_user)],
    db: AsyncSession = Depends(get_db),
):
    try:
        settings = await get_settings(db)

        promocode_discount_perc = await get_promocode_discount_perc(cart, db)

        # Fetch all BookDetails and their related Book objects
        book_details_ids = [item.book_details_id for item in cart.borrow_books] + [
            item.book_details_id for item in cart.purchase_books
        ]

        stmt = (
            select(BookDetails)
            .options(joinedload(BookDetails.book))
            .where(BookDetails.id.in_(book_details_ids))
        )
        result = await db.execute(stmt)
        book_details_map = {
            book_details.id: book_details for book_details in result.scalars().all()
        }

        # Check borrowing limit
        validate_borrowing_limit(cart, user, settings)

        borrow_order_books = []
        purchase_order_books = []
        total_order_value = Decimal("0.0")

        # Delivery fees
        delivery_fees = get_delivery_fees(cart, settings)
        if delivery_fees is not None:
            total_order_value = total_order_value + delivery_fees

        # Create the main Order object
        order = Order(
            address=cart.address,
            phone_number=cart.phone_number,
            pick_up_date=None,
            pick_up_type=cart.pick_up_type,
            status=OrderStatus.CREATED.value,
            delivery_fees=delivery_fees,
            user_id=user.id,
            promo_code_id=cart.promocode_id,
        )
        db.add(order)

        # Borrowed books
        for item in cart.borrow_books:
            book_details = book_details_map.get(item.book_details_id)
            if not book_details:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Book details with id {item.book_details_id} not found.",
                )

            validate_borrow_book_and_borrowing_weeks_and_available_stock(
                item, book_details
            )

            # Calculate borrowing fees for each book using the updated function
            fees_data = calculate_borrow_order_book_fees(
                book_price=book_details.book.price,
                borrowing_weeks=item.borrowing_weeks,
                borrow_perc=settings.borrow_perc,
                deposit_perc=settings.deposit_perc,
                delay_perc=settings.delay_perc,
                min_borrow_fee=settings.min_borrow_fee,
                promocode_perc=promocode_discount_perc,
            )

            borrow_fees = fees_data["borrow_fees"]
            deposit_fees = fees_data["deposit_fees"]
            delay_fees_per_day = fees_data["delay_fees_per_day"]
            promocode_discount = fees_data["promocode_discount"]

            total_order_value = total_order_value + borrow_fees + deposit_fees

            # Create a single BorrowOrderBook record for each borrowed item
            borrow_book = BorrowOrderBook(
                borrowing_weeks=item.borrowing_weeks,
                borrow_book_problem=BorrowBookProblem.NORMAL.value,
                deposit_fees=deposit_fees,
                borrow_fees=borrow_fees,
                delay_fees_per_day=delay_fees_per_day,
                promocode_discount=promocode_discount,
                book_details_id=book_details.id,
                order=order,
                user_id=user.id,
                return_date=None,
                return_order_id=None,
            )
            borrow_order_books.append(borrow_book)

            # Decrement stock
            book_details.available_stock -= 1

        # Purchased books
        for item in cart.purchase_books:
            book_details = book_details_map.get(item.book_details_id)
            if not book_details:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Book details with id {item.book_details_id} not found.",
                )

            validate_purchase_book_and_available_stock(item, book_details)

            # Use the new function to calculate fees for purchased books
            purchase_fees_data = calculate_purchase_order_book_fees(
                book_price=book_details.book.price,
                quantity=item.quantity,
                promocode_perc=promocode_discount_perc,
            )

            paid_price_per_book = purchase_fees_data["paid_price_per_book"]
            promocode_discount_per_book = purchase_fees_data[
                "promocode_discount_per_book"
            ]

            # Add the total price (after discount) to the overall order value
            total_order_value = total_order_value + paid_price_per_book * item.quantity

            # Create a single PurchaseOrderBook record
            purchase_book = PurchaseOrderBook(
                quantity=item.quantity,
                paid_price_per_book=paid_price_per_book,
                promocode_discount_per_book=promocode_discount_per_book,
                order=order,
                book_details_id=book_details.id,
                user_id=user.id,
            )
            purchase_order_books.append(purchase_book)

            # Decrement stock
            book_details.available_stock -= item.quantity

        # This ensures order.id is available to link the transaction as transaction is not a direct child to order
        await db.flush()

        # Pay money and add to transaction history
        await pay_from_wallet(
            db=db,
            user=user,
            amount=total_order_value,
            description=f"Payment for Order ID: {order.id}",
            order_id=order.id,
        )

        # TODO: send notification to user

        # Add all new order books to the session
        db.add_all(borrow_order_books)
        db.add_all(purchase_order_books)

        # Commit the transaction
        await db.commit()
        await db.refresh(order)

        return {"message": "Order created successfully", "order_id": order.id}

    except HTTPException as e:
        # If an HTTPException is raised, rollback and re-raise the exception
        await db.rollback()
        raise e
    except Exception as e:
        # For any other unexpected error, rollback and raise a generic 500 error
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the order: {str(e)}",
        )




# PATCH /order/{order_id}         update status. order_id
# PATCH /return_order/{order_id}  update status. order_id
