from __future__ import annotations

from db.base import Base
from sqlalchemy import ForeignKey, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Cart(Base):
    __tablename__ = "carts"
    __table_args__ = (Index("ix_user_id", "user_id"),)

    quantity: Mapped[int] = mapped_column(Integer, default=1)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    book_details_id: Mapped[int] = mapped_column(
        ForeignKey("book_details.id"), primary_key=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="cart")  # type: ignore  # noqa: F821
    book_details: Mapped[BookDetails] = relationship(back_populates="cart_items")  # type: ignore  # noqa: F821
