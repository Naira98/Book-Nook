from decimal import Decimal

from db.base import Base
from sqlalchemy import CheckConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column


class Settings(Base):
    __tablename__ = "settings"
    __table_args__ = (CheckConstraint("id = 1", name="settings_singleton"),)

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    deposit_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    borrow_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    delay_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    delivery_fees: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    max_num_of_borrow_books: Mapped[int]


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str]
    discount_perc: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    is_active: Mapped[bool] = mapped_column(default=True)
