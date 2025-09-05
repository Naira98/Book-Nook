from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from models.book import BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    OrderStatus,
    PickUpType,
    ReturnOrder,
    ReturnOrderStatus,
)
from models.user import User, UserRole
from schemas.order import (
    UpdateReturnOrderStatusRequest,
)
from schemas.return_order import (
    ReturnOrderRequest,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from utils.order import (
    validate_return_order_for_courier,
    validate_return_order_for_employee,
)
from utils.socket import (
    send_courier_return_order,
    send_created_return_order,
    send_updated_return_order,
)
from utils.wallet import add_to_wallet, pay_from_wallet

from crud.settings import get_settings_crud


async def get_client_borrows_books_crud(
    user_id: int,
    db: AsyncSession,
):
    stmt = (
        select(BorrowOrderBook)
        .join(Order, BorrowOrderBook.order_id == Order.id)
        .options(
            selectinload(BorrowOrderBook.book_details).options(
                joinedload(BookDetails.book)
            )
        )
        .where(
            BorrowOrderBook.user_id == user_id,
            BorrowOrderBook.return_order_id.is_(None),
            Order.status == OrderStatus.PICKED_UP,
            BorrowOrderBook.borrow_book_problem == BorrowBookProblem.NORMAL,
        )
    )
    result = await db.execute(stmt)
    borrowed_books = result.scalars().unique().all()

    serialized_books = [
        {
            "book_details_id": book.id,
            "borrowing_weeks": book.borrowing_weeks,
            "expected_return_date": book.expected_return_date,
            "deposit_fees": book.deposit_fees,
            "borrow_fees": book.borrow_fees,
            "delay_fees_per_day": book.delay_fees_per_day,
            "book": {
                "id": book.book_details.book.id,
                "title": book.book_details.book.title,
                "cover_img": book.book_details.book.cover_img,
            },
        }
        for book in borrowed_books
    ]

    return serialized_books


async def get_client_return_orders_crud(db: AsyncSession, user: User):
    try:
        get_return_orders_query = (
            select(ReturnOrder)
            .options(joinedload(ReturnOrder.user))
            .options(
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                ),
            )
            .where(ReturnOrder.user_id == user.id)
            .order_by(ReturnOrder.created_at.desc())
        )

        return_orders_result = await db.execute(get_return_orders_query)

        return_orders = return_orders_result.scalars().unique().all()

        return {"return_orders": return_orders}

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching orders: {str(e)}",
        )


async def get_client_return_order_details_crud(
    db: AsyncSession, user: User, return_order_id: int
):
    try:
        get_return_order_query = (
            select(ReturnOrder)
            .options(joinedload(ReturnOrder.user))
            .options(
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                ),
            )
            .where(ReturnOrder.user_id == user.id, ReturnOrder.id == return_order_id)
        )

        return_return_order_result = await db.execute(get_return_order_query)

        return_order = return_return_order_result.scalars().unique().first()
        if not return_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Return Order with id {return_order_id} not found.",
            )

        return return_order

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching orders: {str(e)}",
        )


async def create_return_order_crud(
    user: User,
    return_order_data: ReturnOrderRequest,
    db: AsyncSession,
):
    delivery_fees = Decimal("0.0")

    if return_order_data.pickup_type == PickUpType.COURIER:
        if not return_order_data.address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Address is required for courier pickup.",
            )
        if not return_order_data.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is required for courier pickup.",
            )

        settings = await get_settings_crud(db)

        delivery_fees = Decimal(settings.delivery_fees)

    return_order = ReturnOrder(
        address=return_order_data.address,
        phone_number=return_order_data.phone_number,
        pickup_type=return_order_data.pickup_type,
        status=ReturnOrderStatus.CREATED,
        delivery_fees=delivery_fees,
        user_id=user.id,
    )

    db.add(return_order)
    await db.flush()

    if return_order_data.pickup_type == PickUpType.COURIER:
        await pay_from_wallet(
            db=db,
            user=user,
            amount=delivery_fees,
            description=f"Delivery fees for Return Order ID:{return_order.id}",
            apply_negative_balance=False,
        )

    stmt_books_to_return = (
        select(BorrowOrderBook)
        .where(
            BorrowOrderBook.id.in_(return_order_data.borrowed_books_ids),
            BorrowOrderBook.user_id == user.id,
            BorrowOrderBook.return_order_id.is_(None),
        )
        .options(selectinload(BorrowOrderBook.order))
    )

    result_books_to_return = await db.execute(stmt_books_to_return)
    books_to_update = result_books_to_return.scalars().all()

    if len(books_to_update) != len(return_order_data.borrowed_books_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more selected books are not valid for return or not currently loaned to you.",
        )

    for book in books_to_update:
        if book.order.status != OrderStatus.PICKED_UP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book ID {book.id} (Title: {book.book_details.book.title}) has not been picked up yet.",
            )
        if book.borrow_book_problem != BorrowBookProblem.NORMAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book ID {book.id} (Title: {book.book_details.book.title}) has a problem status and cannot be returned normally.",
            )

        book.return_order_id = return_order.id

    await db.commit()
    await db.refresh(return_order)

    await send_created_return_order(return_order, return_order_data.borrowed_books_ids)

    return return_order


async def update_return_order_status_crud(
    db: AsyncSession,
    staff_user: User,
    return_order_data: UpdateReturnOrderStatusRequest,
):
    try:
        query = (
            select(ReturnOrder)
            .where(ReturnOrder.id == return_order_data.id)
            .options(joinedload(ReturnOrder.user))
            .options(
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                )
            )
        )
        result = await db.execute(query)
        db_return_order = result.scalar_one_or_none()

        if not db_return_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Return Order with id {return_order_data.id} not found.",
            )

        if staff_user.role == UserRole.COURIER:
            validate_return_order_for_courier(
                return_order_data, db_return_order, staff_user
            )

        if staff_user.role == UserRole.EMPLOYEE:
            validate_return_order_for_employee(return_order_data, db_return_order)

        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY.value:
            db_return_order.courier_id = staff_user.id

        if (
            return_order_data.status == ReturnOrderStatus.DONE.value
            and return_order_data.borrow_order_books_details is not None
        ):
            for db_book in db_return_order.borrow_order_books_details:
                for new_book in return_order_data.borrow_order_books_details:
                    if db_book.id == new_book.id:
                        db_book.borrow_book_problem = new_book.borrow_book_problem
                        break

            amount_to_add: Decimal = Decimal(0)
            amount_to_withdraw: Decimal = Decimal(0)
            now_utc = datetime.now(timezone.utc)

            for book in db_return_order.borrow_order_books_details:
                book.actual_return_date = now_utc
                db_return_order.user.current_borrowed_books -= 1

                if book.expected_return_date is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Book with id {book.id} has not been picked up yet.",
                    )

                if book.borrow_book_problem == BorrowBookProblem.NORMAL.value:
                    if (
                        book.expected_return_date
                        and book.expected_return_date < now_utc
                    ):
                        days_overdue = (now_utc - book.expected_return_date).days
                        amount_to_withdraw += days_overdue * book.delay_fees_per_day
                    else:
                        amount_to_add += book.deposit_fees

                    book.book_details.available_stock += 1

                elif book.borrow_book_problem == BorrowBookProblem.LOST.value:
                    book_price_after_discount = book.original_book_price
                    if book.promo_code_discount:
                        book_price_after_discount -= book.promo_code_discount

                    amount_to_withdraw += book_price_after_discount - book.deposit_fees

            # This after for loop
            if amount_to_add > 0:
                await add_to_wallet(
                    db=db,
                    user=db_return_order.user,
                    amount=amount_to_add,
                    description=f"Deposit return for Return Order ID: {db_return_order.id}",
                )
            if amount_to_withdraw > 0:
                await pay_from_wallet(
                    db=db,
                    user=db_return_order.user,
                    amount=amount_to_withdraw,
                    description=f"Penalty fees for Return Order ID: {db_return_order.id}",
                    apply_negative_balance=True,
                )

        db_return_order.status = return_order_data.status
        await db.commit()
        await db.refresh(db_return_order)
        db_return_order.number_of_books = len(
            db_return_order.borrow_order_books_details
        )

        # TODO send notification to user
        if return_order_data.status == ReturnOrderStatus.ON_THE_WAY.value:
            await send_updated_return_order(db_return_order, UserRole.COURIER)

        if return_order_data.status == ReturnOrderStatus.PICKED_UP.value:
            await send_courier_return_order(db_return_order)

        if return_order_data.status == ReturnOrderStatus.CHECKING.value:
            await send_updated_return_order(db_return_order, UserRole.EMPLOYEE)

        return db_return_order

    except Exception as e:
        # For any other unexpected error, rollback and raise a generic 500 error
        await db.rollback()
        raise e


async def get_staff_return_order_details_crud(
    db: AsyncSession,
    staff_user: User,
    return_order_id: int,
):
    conditions = [ReturnOrder.id == return_order_id]

    if staff_user.role == UserRole.COURIER:
        conditions.append(ReturnOrder.courier_id == staff_user.id)

    try:
        query = (
            select(ReturnOrder)
            .where(*conditions)
            .options(
                joinedload(ReturnOrder.user),
                selectinload(ReturnOrder.borrow_order_books_details).options(
                    joinedload(BorrowOrderBook.book_details).options(
                        joinedload(BookDetails.book)
                    ),
                ),
            )
            .order_by(ReturnOrder.created_at.desc())
        )

        result = await db.execute(query)
        return_order = result.scalars().first()
        if not return_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {return_order_id} not found.",
            )

        return_order.number_of_books = len(return_order.borrow_order_books_details)
        return return_order

    except Exception as e:
        # For any unexpected error, raise a generic 500 error with the exception details
        raise e
