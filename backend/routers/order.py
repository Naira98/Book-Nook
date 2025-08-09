from datetime import datetime
from decimal import Decimal
from typing import Annotated, List, Optional

from db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status, Body
from models.book import BookDetails
from models.cart import Cart
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    OrderStatus,
    PurchaseOrderBook,
    PickUpType,
    ReturnOrder,
)
from models.user import User, UserRole
from schemas.order import (
    BorrowOrderBookUpdateProblemResponse,
    CreateOrderRequest,
    OrderCreatedUpdateResponse,
    OrderResponseSchema,
    GetAllOrdersResponse,
)
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.auth import get_user, get_staff_user
from utils.order import (
    calculate_borrow_order_book_fees,
    calculate_purchase_order_book_fees,
    get_delivery_fees,
    get_promo_code_discount_perc,
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
    try:
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

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching orders: {str(e)}",
        )


@order_router.get(
    "/all", response_model=GetAllOrdersResponse, status_code=status.HTTP_200_OK
)
async def get_all_orders(
    user: Annotated[User, Depends(get_staff_user)],
    order_status: PickUpType,
    db: AsyncSession = Depends(get_db),
    courier_id: Optional[int | None] = None,
):
    try:
        conditions = [Order.pick_up_type == order_status]

        if courier_id is not None:
            conditions.append(Order.courier_id == courier_id)

        get_orders_query = (
            select(Order)
            .options(joinedload(Order.user))
            .options(
                selectinload(Order.borrow_order_books_details),
                selectinload(Order.purchase_order_books_details),
            )
        )

        get_return_orders_query = (
            select(ReturnOrder)
            .options(joinedload(ReturnOrder.user))
            .options(selectinload(ReturnOrder.borrow_order_books_details))
        )

        get_orders_query = get_orders_query.where(*conditions).order_by(
            Order.created_at.desc()
        )
        get_return_orders_query = get_return_orders_query.where(*conditions).order_by(
            ReturnOrder.created_at.desc()
        )

        # .order_by(Order.created_at.desc())
        orders_result = await db.execute(get_orders_query)
        return_orders_result = await db.execute(get_return_orders_query)

        orders = orders_result.scalars().unique().all()
        return_orders = return_orders_result.scalars().unique().all()

        for order in orders:
            order.number_of_books = len(order.borrow_order_books_details) + len(
                order.purchase_order_books_details
            )

        for return_order in return_orders:
            return_order.number_of_books = len(return_order.borrow_order_books_details)

        return {
            "orders": orders,
            "return_orders": return_orders,
        }

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching orders: {str(e)}",
        )


@order_router.post(
    "/", response_model=OrderCreatedUpdateResponse, status_code=status.HTTP_201_CREATED
)
async def create_order(
    cart: CreateOrderRequest,
    user: Annotated[User, Depends(get_user)],
    db: AsyncSession = Depends(get_db),
):
    try:
        settings = await get_settings(db)

        # Check borrowing limit
        validate_borrowing_limit(cart, user, settings.max_num_of_borrow_books)

        promo_code_discount_perc = await get_promo_code_discount_perc(cart, db)

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

        borrow_order_books = []
        purchase_order_books = []
        total_order_value = Decimal("0.0")

        # Delivery fees
        delivery_fees = get_delivery_fees(cart, settings.delivery_fees)
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
            promo_code_id=cart.promo_code_id,
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
                promo_code_perc=promo_code_discount_perc,
            )

            borrow_fees = fees_data["borrow_fees"]
            deposit_fees = fees_data["deposit_fees"]
            delay_fees_per_day = fees_data["delay_fees_per_day"]
            promo_code_discount = fees_data["promo_code_discount"]

            total_order_value = total_order_value + borrow_fees + deposit_fees

            # Create a single BorrowOrderBook record for each borrowed item
            borrow_book = BorrowOrderBook(
                borrowing_weeks=item.borrowing_weeks,
                borrow_book_problem=BorrowBookProblem.NORMAL.value,
                deposit_fees=deposit_fees,
                borrow_fees=borrow_fees,
                delay_fees_per_day=delay_fees_per_day,
                promo_code_discount=promo_code_discount,
                original_book_price=book_details.book.price,
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
                promo_code_perc=promo_code_discount_perc,
            )

            paid_price_per_book = purchase_fees_data["paid_price_per_book"]
            promo_code_discount_per_book = purchase_fees_data[
                "promo_code_discount_per_book"
            ]

            # Add the total price (after discount) to the overall order value
            total_order_value = total_order_value + paid_price_per_book * item.quantity

            # Create a single PurchaseOrderBook record
            purchase_book = PurchaseOrderBook(
                quantity=item.quantity,
                paid_price_per_book=paid_price_per_book,
                promo_code_discount_per_book=promo_code_discount_per_book,
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

        # Delete cart items after order creation
        await db.execute(delete(Cart).where(Cart.user_id == user.id))

        # Commit the transaction
        await db.commit()

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


# TODO: ensure employee or courier who update order status
@order_router.patch(
    "/order_status",
    response_model=OrderCreatedUpdateResponse,
    status_code=status.HTTP_200_OK,
)
async def update_order_status(
    order_id: Annotated[int, Body()],
    new_status: Annotated[OrderStatus, Body()],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_staff_user),
):
    try:
        query = select(Order).where(Order.id == order_id)
        result = await db.execute(query)
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found.",
            )
        if new_status == OrderStatus.ON_THE_WAY:
            if user.role != UserRole.COURIER:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only couriers can set order status to ON_THE_WAY",
                )

            order.courier_id = user.id

        if new_status == OrderStatus.PICKED_UP:
            if user.role == UserRole.COURIER and order.courier_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to update this order's status.",
                )

            order.pick_up_date = datetime.now()
        elif new_status == OrderStatus.PROBLEM:
            # TODO: send notification to user about the problem
            pass

        order.status = new_status
        await db.commit()
        await db.refresh(order)

        return {
            "message": f"Order status updated successfully to {new_status.value}",
            "order_id": order.id,
        }

    except HTTPException as e:
        # If an HTTPException is raised, rollback and re-raise it
        await db.rollback()
        raise e
    except Exception as e:
        # For any other unexpected error, rollback and raise a generic 500 error
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while updating the order status: {str(e)}",
        )


@order_router.patch(
    "/borrow_order_book_problem",
    response_model=BorrowOrderBookUpdateProblemResponse,
    status_code=status.HTTP_200_OK,
)
async def update_borrow_order_book_status(
    borrow_order_book_id: Annotated[int, Body()],
    new_status: Annotated[BorrowBookProblem, Body()],
    db: AsyncSession = Depends(get_db),
):
    try:
        query = (
            select(BorrowOrderBook)
            .options(joinedload(BorrowOrderBook.user))
            .where(BorrowOrderBook.id == borrow_order_book_id)
        )
        result = await db.execute(query)
        borrow_order_book = result.scalar_one_or_none()

        if not borrow_order_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Borrow order book with id {borrow_order_book_id} not found.",
            )

        if borrow_order_book.borrow_book_problem != BorrowBookProblem.NORMAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update status from {borrow_order_book.borrow_book_problem.value} to {new_status.value}. Only updates from NORMAL are allowed to a non-NORMAL state.",
            )

        if (
            new_status == BorrowBookProblem.LOST
            or new_status == BorrowBookProblem.DAMAGED
        ):
            # TODO: send notification to user about the problem

            # TODO: what if book is damaged should all its fees be charged?
            # TODO: What should happen if user has insufficient funds in wallet?
            # TODO: if promocode applied, should it be considered in the fees?

            plenty_fees = borrow_order_book.original_book_price - (
                borrow_order_book.deposit_fees + borrow_order_book.borrow_fees
            )
            await pay_from_wallet(
                db=db,
                user=borrow_order_book.user,
                amount=plenty_fees,
                description=f"Charge for lost or damaged book (ID: {borrow_order_book.book_details_id})",
                order_id=None,
            )

        borrow_order_book.borrow_book_problem = new_status
        await db.commit()
        await db.refresh(borrow_order_book)

        return {
            "message": f"Borrow order book status updated successfully to {new_status.value}",
            "borrow_order_book_id": borrow_order_book.id,
        }

    except HTTPException as e:
        await db.rollback()
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while updating the borrow order book status: {str(e)}",
        )


# PATCH /return_order/{order_id}  update status. order_id
