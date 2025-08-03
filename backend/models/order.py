from __future__ import annotations
from .settings import PromoCode
from datetime import datetime
from decimal import Decimal
from enum import Enum


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
    borrowing_days: Mapped[int]
    return_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    borrow_book_problem: Mapped[BorrowBookProblem] = mapped_column(
        default=BorrowBookProblem.NORMAL.value
    )
    deposit_fees: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    borrow_fees: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    delay_fees_per_day: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    promo_code_discount: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))

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
    price: Mapped[Decimal] = mapped_column(Numeric(4, 2))

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
    __table_args__ = (Index("ix_user_promo_code", "user_id", "promo_code_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    address: Mapped[str]
    phone_number: Mapped[str]
    pick_up_date: Mapped[datetime | None] = mapped_column(default=None, nullable=True)
    pick_up_type: Mapped[PickUpType]
    status: Mapped[OrderStatus] = mapped_column(default=OrderStatus.CREATED.value)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    promo_code_id: Mapped[int | None] = mapped_column(
        ForeignKey("promo_codes.id"), nullable=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="orders")  # type: ignore  # noqa: F821
    promo_code: Mapped[PromoCode | None] = relationship(back_populates="orders")  # type: ignore # noqa: F821
    borrow_order_books_details: Mapped[list[BorrowOrderBook]] = relationship(
        back_populates="order"
    )
    purchase_order_books_details: Mapped[list[PurchaseOrderBook]] = relationship(
        back_populates="order"
    )


class ReturnOrder(Base):
    __tablename__ = "return_orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    address: Mapped[str]
    phone_number: Mapped[str]
    pick_up_type: Mapped[PickUpType]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    status: Mapped[ReturnOrderStatus] = mapped_column(
        default=ReturnOrderStatus.CREATED.value
    )

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    courier_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

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
        back_populates="courier_orders", foreign_keys=[courier_id]
    )
