from decimal import Decimal

from core.auth import get_password_hash
from fastapi import HTTPException, status
from models.book import Book, BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    PurchaseOrderBook,
    ReturnOrder,
)
from models.settings import Settings
from models.transaction import Transaction, TransactionType
from models.user import User, UserStatus
from schemas.manager import (
    AddNewUserRequest,
    FinancialStats,
    InventoryStats,
    LowStockBook,
    ManagerDashboardStats,
    MostBorrowedBook,
    OrderStats,
    ReturnOrderStats,
    SettingsUpdate,
    SuccessMessage,
    TopSellingBook,
    UserStats,
)
from sqlalchemy import func, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession


async def get_manager_dashboard_stats_crud(db: AsyncSession):
    # --- Order Statistics ---
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar_one()

    orders_by_status_result = await db.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status)
    )
    orders_by_status = {s.value: count for s, count in orders_by_status_result.all()}

    orders_by_pickup_type_result = await db.execute(
        select(Order.pickup_type, func.count(Order.id)).group_by(Order.pickup_type)
    )
    orders_by_pickup_type = {
        pt.value: count for pt, count in orders_by_pickup_type_result.all()
    }

    total_delivery_fees_orders = await db.scalar(
        select(func.sum(Order.delivery_fees)).filter(Order.delivery_fees.isnot(None))
    ) or Decimal(0)
    total_delivery_fees_return_orders = await db.scalar(
        select(func.sum(ReturnOrder.delivery_fees)).filter(
            ReturnOrder.delivery_fees.isnot(None)
        )
    ) or Decimal(0)
    total_delivery_fees = total_delivery_fees_orders + total_delivery_fees_return_orders

    order_stats = OrderStats(
        total_orders=total_orders,
        orders_by_status=orders_by_status,
        orders_by_pickup_type=orders_by_pickup_type,
        total_delivery_fees=total_delivery_fees,
    )

    # --- Return Order Statistics ---
    total_return_orders_result = await db.execute(select(func.count(ReturnOrder.id)))
    total_return_orders = total_return_orders_result.scalar_one()

    return_orders_by_status_result = await db.execute(
        select(ReturnOrder.status, func.count(ReturnOrder.id)).group_by(
            ReturnOrder.status
        )
    )
    return_orders_by_status = {
        s.value: count for s, count in return_orders_by_status_result.all()
    }

    lost_books_count_result = await db.execute(
        select(func.count(BorrowOrderBook.id)).filter(
            BorrowOrderBook.borrow_book_problem == BorrowBookProblem.LOST
        )
    )
    lost_books_count = lost_books_count_result.scalar_one()

    damaged_books_count_result = await db.execute(
        select(func.count(BorrowOrderBook.id)).filter(
            BorrowOrderBook.borrow_book_problem == BorrowBookProblem.DAMAGED
        )
    )
    damaged_books_count = damaged_books_count_result.scalar_one()

    return_order_stats = ReturnOrderStats(
        total_return_orders=total_return_orders,
        return_orders_by_status=return_orders_by_status,
        lost_books=lost_books_count,
        damaged_books=damaged_books_count,
    )

    # --- Financial Statistics ---
    total_purchase_revenue = await db.scalar(
        select(
            func.sum(PurchaseOrderBook.paid_price_per_book * PurchaseOrderBook.quantity)
        )
    ) or Decimal(0)
    total_borrowing_revenue = await db.scalar(
        select(func.sum(BorrowOrderBook.borrow_fees))
    ) or Decimal(0)

    total_promo_code_discounts_purchase = await db.scalar(
        select(
            func.sum(
                PurchaseOrderBook.promo_code_discount_per_book
                * PurchaseOrderBook.quantity
            )
        ).filter(PurchaseOrderBook.promo_code_discount_per_book.isnot(None))
    ) or Decimal(0)
    total_promo_code_discounts_borrow = await db.scalar(
        select(func.sum(BorrowOrderBook.promo_code_discount)).filter(
            BorrowOrderBook.promo_code_discount.isnot(None)
        )
    ) or Decimal(0)
    total_promo_code_discounts = (
        total_promo_code_discounts_purchase + total_promo_code_discounts_borrow
    )

    total_wallet_deposits = await db.scalar(
        select(func.sum(Transaction.amount)).filter(
            Transaction.transaction_type == TransactionType.ADDING.value
        )
    ) or Decimal(0)
    total_wallet_withdrawals = await db.scalar(
        select(func.sum(Transaction.amount)).filter(
            Transaction.transaction_type == TransactionType.WITHDRAWING.value
        )
    ) or Decimal(0)
    total_current_wallet_balance = await db.scalar(
        select(func.sum(User.wallet))
    ) or Decimal(0)

    financial_stats = FinancialStats(
        total_purchase_revenue=total_purchase_revenue,
        total_borrowing_revenue=total_borrowing_revenue,
        total_delivery_revenue=total_delivery_fees,
        total_promo_code_discounts=total_promo_code_discounts,
        total_wallet_deposits=total_wallet_deposits,
        total_wallet_withdrawals=total_wallet_withdrawals,
        total_current_wallet_balance=total_current_wallet_balance,
    )

    # --- Inventory Statistics ---
    total_books_result = await db.execute(select(func.count(Book.id)))
    total_books = total_books_result.scalar_one()

    books_by_status_result = await db.execute(
        select(BookDetails.status, func.count(BookDetails.id)).group_by(
            BookDetails.status
        )
    )
    books_by_status = {s.value: count for s, count in books_by_status_result.all()}

    low_stock_books_result = await db.execute(
        select(Book.title, BookDetails.available_stock)
        .join(BookDetails)
        .filter(BookDetails.available_stock < 5)
        .limit(10)
    )
    low_stock_books = [
        LowStockBook(title=title, available_stock=stock)
        for title, stock in low_stock_books_result.all()
    ]

    top_5_bestselling_books_result = await db.execute(
        select(
            Book.title,
            func.sum(PurchaseOrderBook.quantity).label("total_sold_quantity"),
        )
        .join(BookDetails, Book.book_details)
        .join(PurchaseOrderBook)
        .group_by(Book.id)
        .order_by(func.sum(PurchaseOrderBook.quantity).desc())
        .limit(5)
    )
    top_5_bestselling_books = [
        TopSellingBook(title=title, total_sold_quantity=qty)
        for title, qty in top_5_bestselling_books_result.all()
    ]

    # Top 5 Most Borrowed Books
    top_5_most_borrowed_books_result = await db.execute(
        select(Book.title, func.count(BorrowOrderBook.id).label("total_borrows"))
        .join(BookDetails, Book.book_details)
        .join(BorrowOrderBook)
        .group_by(Book.id)
        .order_by(func.count(BorrowOrderBook.id).desc())
        .limit(5)
    )
    top_5_most_borrowed_books = [
        MostBorrowedBook(title=title, total_borrows=borrows)
        for title, borrows in top_5_most_borrowed_books_result.all()
    ]

    inventory_stats = InventoryStats(
        total_books=total_books,
        books_by_status=books_by_status,
        low_stock_books=low_stock_books,
        top_5_bestselling_books=top_5_bestselling_books,
        top_5_most_borrowed_books=top_5_most_borrowed_books,
    )

    # --- User Statistics ---
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar_one()

    users_by_role_result = await db.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    users_by_role = {r.value: count for r, count in users_by_role_result.all()}

    users_by_status_result = await db.execute(
        select(User.status, func.count(User.id)).group_by(User.status)
    )
    users_by_status = {s.value: count for s, count in users_by_status_result.all()}

    user_stats = UserStats(
        total_users=total_users,
        users_by_role=users_by_role,
        users_by_status=users_by_status,
    )

    return ManagerDashboardStats(
        order_stats=order_stats,
        return_order_stats=return_order_stats,
        financial_stats=financial_stats,
        inventory_stats=inventory_stats,
        user_stats=user_stats,
    )


async def update_settings_crud(db: AsyncSession, settings_update: SettingsUpdate):
    try:
        # Get non-null fields from the update request
        update_data = settings_update.model_dump(exclude_unset=True, exclude_none=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )

        # Check if settings exist
        result = await db.execute(select(Settings))
        settings = result.scalar_one_or_none()

        if not settings:
            # Create new settings with provided values and defaults for others
            default_values = {
                "deposit_perc": Decimal("30.00"),
                "borrow_perc": Decimal("10.00"),
                "delay_perc": Decimal("3.00"),
                "delivery_fees": Decimal("20.00"),
                "min_borrow_fee": Decimal("5.00"),
                "max_num_of_borrow_books": 3,
            }
            # Merge provided values with defaults (only non-None values)
            provided_values = {k: v for k, v in update_data.items() if v is not None}
            create_data = {**default_values, **provided_values}
            new_settings = Settings(**create_data)
            db.add(new_settings)
            await db.commit()
            await db.refresh(new_settings)
            return new_settings

        # Update existing settings (only non-None values)
        valid_update_data = {k: v for k, v in update_data.items() if v is not None}

        if not valid_update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update",
            )

        stmt = (
            update(Settings)
            .where(Settings.id == 1)
            .values(**valid_update_data)
            .returning(Settings)
        )

        result = await db.execute(stmt)
        updated_settings = result.scalar_one()
        await db.commit()

        # Refresh to get the updated object
        await db.refresh(updated_settings)
        return updated_settings

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating settings: {str(e)}",
        )


async def add_new_staff_crud(db: AsyncSession, user_data: AddNewUserRequest):
    try:
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already exists")

        result = await db.execute(
            select(User).where(User.phone_number == user_data.phone_number)
        )
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Phone number already exists")
        result = await db.execute(
            select(User).where(User.national_id == user_data.national_id)
        )
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="National ID already exists")

        hashed_password = get_password_hash(user_data.password)

        new_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            password=hashed_password,
            status=UserStatus.ACTIVATED.value,
            phone_number=user_data.phone_number,
            national_id=user_data.national_id,
            role=user_data.role,
        )

    except SQLAlchemyError as db_error:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
    db.add(new_user)
    await db.commit()
    return SuccessMessage(
        success=True, status_code=201, message="User added successfully!"
    )


async def list_all_users_crud(db: AsyncSession):
    users = await db.execute(select(User))
    return users.scalars().all()
