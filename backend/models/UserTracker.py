from __future__ import annotations

from db.base import Base
from models.book import Book
from models.user import User
from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class UserTracker(Base):
    __tablename__ = "user_tracker"
    __table_args__ = (
        Index("ix_user_tracker_user_id", "user_id"),
        Index("ix_user_tracker_user_id_book_id", "user_id", "book_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(25))

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))

    user: Mapped[User] = relationship(back_populates="user_tracker")  # type: ignore  # noqa: F821
    book: Mapped[Book] = relationship(back_populates="book_tracker")  # type: ignore
