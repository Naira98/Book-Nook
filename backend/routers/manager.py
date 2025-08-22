from decimal import Decimal

from db.database import get_db
from fastapi import APIRouter, Depends
from models.book import Book, BookDetails
from models.order import (
    BorrowBookProblem,
    BorrowOrderBook,
    Order,
    PurchaseOrderBook,
    ReturnOrder,
)
from models.transaction import Transaction, TransactionType
from models.user import User
from schemas.manager import (
    FinancialStats,
    InventoryStats,
    LowStockBook,
    ManagerDashboardStats,
    MostBorrowedBook,
    OrderStats,
    ReturnOrderStats,
    TopSellingBook,
    UserStats,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import manager_required

manager_router = APIRouter(
    prefix="/manager",
    tags=["Manager"],
)


@manager_router.get("/dashboard-stats", response_model=ManagerDashboardStats)
async def get_manager_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _ = Depends(manager_required),
):
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
