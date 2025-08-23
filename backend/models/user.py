from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum

from db.base import Base
from sqlalchemy import DateTime, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .cart import Cart
from .notification import Notification
from .order import Order
from .transaction import Transaction


class UserStatus(Enum):
    ACTIVATED = "ACTIVATED"
    DEACTIVATED = "DEACTIVATED"
    BLOCKED = "BLOCKED"


class UserRole(Enum):
    MANAGER = "MANAGER"
    CLIENT = "CLIENT"
    EMPLOYEE = "EMPLOYEE"
    COURIER = "COURIER"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("stripe_session_id", name="uq_user_stripe_session_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(25))
    last_name: Mapped[str] = mapped_column(String(25))
    email: Mapped[str] = mapped_column(String(255), index=True, unique=True)
    national_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    password: Mapped[str]
    wallet: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.0)
    status: Mapped[UserStatus] = mapped_column(default=UserStatus.DEACTIVATED.value)
    role: Mapped[UserRole] = mapped_column(default=UserRole.CLIENT.value)
    interests: Mapped[str | None] = mapped_column(String(255), nullable=True)
    current_borrowed_books: Mapped[int] = mapped_column(default=0)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    forget_password_token: Mapped[str | None] = mapped_column(
        String, unique=True, nullable=True
    )
    email_verification_token: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Foreign Keys
    cart: Mapped[list[Cart]] = relationship(  # type: ignore  # noqa: F821
        back_populates="user", foreign_keys="[Cart.user_id]"
    )
    orders: Mapped[list[Order]] = relationship(
        back_populates="user", foreign_keys="[Order.user_id]"
    )  # type: ignore  # noqa: F821

    # Explicitly specify foreign_keys for return_orders relationship
    return_orders: Mapped[list[ReturnOrder]] = relationship(  # type: ignore # noqa: F821
        back_populates="user", foreign_keys="[ReturnOrder.user_id]"
    )

    # Explicitly specify foreign_keys for courier_orders relationship
    courier_orders: Mapped[list[Order]] = relationship(  # type: ignore # noqa: F821
        back_populates="courier", foreign_keys="[Order.courier_id]"
    )

    # Explicitly specify foreign_keys for courier_return_orders relationship
    courier_return_orders: Mapped[list[ReturnOrder]] = relationship(  # type: ignore # noqa: F821
        back_populates="courier", foreign_keys="[ReturnOrder.courier_id]"
    )
    notifications: Mapped[list[Notification]] = relationship(  # type: ignore # noqa: F821
        back_populates="user"
    )

    # Relationships
    borrow_order_books: Mapped[list[BorrowOrderBook]] = relationship(  # type: ignore # noqa: F821
        back_populates="user"
    )
    purchase_order_books: Mapped[list[PurchaseOrderBook]] = relationship(  # type: ignore # noqa: F821
        back_populates="user"
    )
    sessions: Mapped[list[Session]] = relationship(back_populates="user")  # type: ignore # noqa: F821
    transactions: Mapped[list[Transaction]] = relationship(back_populates="user")  # type: ignore  # noqa: F821

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role.value})>"
