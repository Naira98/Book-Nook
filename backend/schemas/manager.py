from decimal import Decimal
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


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


class SettingsBase(BaseModel):
    deposit_perc: Decimal = Field(
        ..., ge=0, le=100, description="Deposit percentage (0-100)"
    )
    borrow_perc: Decimal = Field(
        ..., ge=0, le=100, description="Borrow percentage (0-100)"
    )
    delay_perc: Decimal = Field(
        ..., ge=0, le=100, description="Delay percentage (0-100)"
    )
    delivery_fees: Decimal = Field(..., ge=0, description="Delivery fees")
    min_borrow_fee: Decimal = Field(..., ge=0, description="Minimum borrow fee")
    max_num_of_borrow_books: int = Field(
        ..., ge=1, description="Maximum number of borrowable books"
    )


class SettingsResponse(SettingsBase):
    id: int

    class Config:
        from_attributes = True
        json_encoders = {Decimal: str}


class SettingsUpdate(BaseModel):
    deposit_perc: Optional[Decimal] = Field(
        None, ge=0, le=100, description="Deposit percentage (0-100)"
    )
    borrow_perc: Optional[Decimal] = Field(
        None, ge=0, le=100, description="Borrow percentage (0-100)"
    )
    delay_perc: Optional[Decimal] = Field(
        None, ge=0, le=100, description="Delay percentage (0-100)"
    )
    delivery_fees: Optional[Decimal] = Field(None, ge=0, description="Delivery fees")
    min_borrow_fee: Optional[Decimal] = Field(
        None, ge=0, description="Minimum borrow fee"
    )
    max_num_of_borrow_books: Optional[int] = Field(
        None, ge=1, description="Maximum number of borrowable books"
    )

    class Config:
        json_encoders = {Decimal: str}
