from __future__ import annotations

from db.base import Base
from sqlalchemy import ForeignKey, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional


class Cart(Base):
    __tablename__ = "carts"
    __table_args__ = (Index("ix_cart_id", "id", "user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    borrowing_weeks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    book_details_id: Mapped[int] = mapped_column(ForeignKey("book_details.id"))

    # Relationships
    user: Mapped[User] = relationship(back_populates="cart")  # type: ignore  # noqa: F821
    book_details: Mapped[BookDetails] = relationship(back_populates="cart_items")  # type: ignore  # noqa: F821
