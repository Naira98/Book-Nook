from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from db.base import Base
from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .order import Order


class TransactionType(Enum):
    WITHDRAWING = "WITHDRAWING"
    ADDING = "ADDING"


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (Index("ix_transactions_user_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    transaction_type: Mapped[TransactionType] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(
        String, nullable=True
    )  # e.g., "Order payment", "Wallet top-up"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    order_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("orders.id"), nullable=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="transactions")  # type: ignore  # noqa: F821
    order: Mapped[Order] = relationship(back_populates="transactions")  # type: ignore # noqa: F821
