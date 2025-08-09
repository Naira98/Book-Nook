from __future__ import annotations

from datetime import datetime

from db.base import Base
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (UniqueConstraint("session", name="uq_yourtable_session"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    session: Mapped[str] = mapped_column(index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Relationships
    user: Mapped[User] = relationship(back_populates="sessions")  # type: ignore # noqa: F821
