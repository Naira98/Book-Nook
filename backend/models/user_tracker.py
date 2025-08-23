from __future__ import annotations

from db.base import Base
from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column


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
