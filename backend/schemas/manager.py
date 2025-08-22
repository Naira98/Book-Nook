from decimal import Decimal
from typing import Dict, List
from pydantic import BaseModel


class OrderStats(BaseModel):
    total_orders: int
    orders_by_status: Dict[str, int]
    orders_by_pickup_type: Dict[str, int]
    total_delivery_fees: Decimal


class ReturnOrderStats(BaseModel):
    total_return_orders: int
    return_orders_by_status: Dict[str, int]
    lost_books: int
    damaged_books: int


class FinancialStats(BaseModel):
    total_purchase_revenue: Decimal
    total_borrowing_revenue: Decimal
    total_delivery_revenue: Decimal
    total_promo_code_discounts: Decimal
    total_wallet_deposits: Decimal
    total_wallet_withdrawals: Decimal
    total_current_wallet_balance: Decimal


class LowStockBook(BaseModel):
    title: str
    available_stock: int


class TopSellingBook(BaseModel):
    title: str
    total_sold_quantity: int


class MostBorrowedBook(BaseModel):
    title: str
    total_borrows: int


class InventoryStats(BaseModel):
    total_books: int
    books_by_status: Dict[str, int]
    low_stock_books: List[LowStockBook]
    top_5_bestselling_books: List[TopSellingBook]
    top_5_most_borrowed_books: List[MostBorrowedBook]


class UserStats(BaseModel):
    total_users: int
    users_by_role: Dict[str, int]
    users_by_status: Dict[str, int]


class ManagerDashboardStats(BaseModel):
    order_stats: OrderStats
    return_order_stats: ReturnOrderStats
    financial_stats: FinancialStats
    inventory_stats: InventoryStats
    user_stats: UserStats
