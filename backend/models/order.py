from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from db.base import Base
from sqlalchemy import DateTime, ForeignKey, Index, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class BorrowBookProblem(Enum):
    NORMAL = "NORMAL"
    LOST = "LOST"
    DAMAGED = "DAMAGED"


class PickUpType(Enum):
    SITE = "SITE"
    COURIER = "COURIER"


class OrderStatus(Enum):
    CREATED = "CREATED"
    ON_THE_WAY = "ON_THE_WAY"
    PICKED_UP = "PICKED_UP"
    PROBLEM = "PROBLEM"


class ReturnOrderStatus(Enum):
    CREATED = "CREATED"
    ON_THE_WAY = "ON_THE_WAY"
    PICKED_UP = "PICKED_UP"
    CHECKING = "CHECKING"
    DONE = "DONE"
    PROBLEM = "PROBLEM"


class BorrowOrderBook(Base):
    __tablename__ = "borrow_order_books"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    borrowing_weeks: Mapped[int]
    actual_return_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expected_return_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    borrow_book_problem: Mapped[BorrowBookProblem] = mapped_column(
        default=BorrowBookProblem.NORMAL.value
    )
    deposit_fees: Mapped[Decimal] = mapped_column(
        Numeric(10, 2)
    )  # The refundable deposit amount.
    borrow_fees: Mapped[Decimal] = mapped_column(
        Numeric(10, 2)
    )  # The borrowing fee after discount.
    delay_fees_per_day: Mapped[Decimal] = mapped_column(
        Numeric(10, 2)
    )  # The daily late fee.
    promo_code_discount: Mapped[Decimal | None] = (
        mapped_column(  # The monetary value of the discount.
            Numeric(10, 2), nullable=True
        )
    )
    original_book_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2)
    )  # The original price of the book before any discounts.

    # Foreign Keys
    book_details_id: Mapped[int] = mapped_column(ForeignKey("book_details.id"))
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    return_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("return_orders.id"), nullable=True
    )

    # Relationships
    book_details: Mapped[BookDetails] = relationship(  # type: ignore # noqa: F821
        back_populates="borrow_order_books_details"
    )
    order: Mapped[Order] = relationship(back_populates="borrow_order_books_details")
    return_order: Mapped[ReturnOrder] = relationship(
        back_populates="borrow_order_books_details"
    )
    user: Mapped[User] = relationship(back_populates="borrow_order_books")  # type: ignore  # noqa: F821


class PurchaseOrderBook(Base):
    __tablename__ = "purchase_order_books"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    quantity: Mapped[int] = mapped_column(default=1)
    paid_price_per_book: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    promo_code_discount_per_book: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True
    )

    # Foreign Keys
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    book_details_id: Mapped[int] = mapped_column(ForeignKey("book_details.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Relationships
    book_details: Mapped[BookDetails] = relationship(  # type: ignore # noqa: F821
        back_populates="purchase_order_books_details"
    )
    order: Mapped[Order] = relationship(back_populates="purchase_order_books_details")
    user: Mapped[User] = relationship(back_populates="purchase_order_books")  # type: ignore  # noqa: F821


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_user_promo_code", "user_id", "promo_code_id"),
        Index("ix_order_id_user_id", "id", "user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    address: Mapped[str | None] = mapped_column(nullable=True)
    phone_number: Mapped[str | None] = mapped_column(nullable=True)
    pickup_date: Mapped[datetime | None] = mapped_column(default=None, nullable=True)
    pickup_type: Mapped[PickUpType]
    status: Mapped[OrderStatus] = mapped_column(default=OrderStatus.CREATED.value)
    delivery_fees: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    promo_code_id: Mapped[int | None] = mapped_column(
        ForeignKey("promo_codes.id"), nullable=True
    )
    courier_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    # Relationships
    user: Mapped[User] = relationship(back_populates="orders", foreign_keys=[user_id])  # type: ignore  # noqa: F821
    promo_code: Mapped[PromoCode | None] = relationship(  # type: ignore # noqa: F821
        back_populates="orders", foreign_keys=[promo_code_id]
    )
    borrow_order_books_details: Mapped[list[BorrowOrderBook]] = relationship(
        back_populates="order"
    )
    purchase_order_books_details: Mapped[list[PurchaseOrderBook]] = relationship(
        back_populates="order"
    )
    courier: Mapped[User] = relationship(  # noqa: F821 # type: ignore
        back_populates="courier_orders", foreign_keys=[courier_id]
    )
    transactions: Mapped[list[Transaction]] = relationship(back_populates="order")  # type: ignore  # noqa: F821


class ReturnOrder(Base):
    __tablename__ = "return_orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    address: Mapped[str | None] = mapped_column(nullable=True)
    phone_number: Mapped[str | None] = mapped_column(nullable=True)
    pickup_type: Mapped[PickUpType]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    status: Mapped[ReturnOrderStatus] = mapped_column(
        default=ReturnOrderStatus.CREATED.value
    )
    delivery_fees: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    courier_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    # Relationships
    borrow_order_books_details: Mapped[list[BorrowOrderBook]] = relationship(
        back_populates="return_order"
    )
    # Explicitly specify foreign_keys for the 'user' relationship
    user: Mapped[User] = relationship(  # noqa: F821 # type: ignore
        back_populates="return_orders", foreign_keys=[user_id]
    )
    # Explicitly specify foreign_keys for the 'courier' relationship
    courier: Mapped[User] = relationship(  # noqa: F821 # type: ignore
        back_populates="courier_return_orders", foreign_keys=[courier_id]
    )
