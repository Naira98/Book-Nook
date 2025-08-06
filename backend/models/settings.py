from __future__ import annotations

from decimal import Decimal

from db.base import Base
from sqlalchemy import CheckConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Settings(Base):
    __tablename__ = "settings"
    __table_args__ = (CheckConstraint("id = 1", name="settings_singleton"),)

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    deposit_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    borrow_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    delay_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    delivery_fees: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    min_borrow_fee: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    max_num_of_borrow_books: Mapped[int]


class PromoCode(Base):
    __tablename__ = "promocodes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str]
    discount_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    is_active: Mapped[bool] = mapped_column(default=True)

    # Relationships
    orders: Mapped[list[Order]] = relationship(back_populates="promocode")  # type: ignore # noqa: F821
