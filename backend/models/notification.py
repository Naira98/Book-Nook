from __future__ import annotations

from datetime import datetime
from enum import Enum

from db.base import Base
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class NotificationType(Enum):
    ORDER_STATUS_UPDATE = "ORDER_STATUS_UPDATE"
    RETURN_ORDER_STATUS_UPDATE = "RETURN_ORDER_STATUS_UPDATE"
    RETURN_REMINDER = "RETURN_REMINDER"
    NEW_PROMO_CODE = "NEW_PROMO_CODE"
    WALLET_UPDATED = "WALLET_UPDATED"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    type: Mapped[NotificationType]
    data: Mapped[JSONB] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="notifications")  # type: ignore # noqa: F821
