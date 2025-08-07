from __future__ import annotations

from datetime import datetime
from enum import Enum

from db.base import Base
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class NotificationStatus(Enum):
    READ = "READ"
    UNREAD = "UNREAD"


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
    status: Mapped[NotificationStatus] = mapped_column(
        default=NotificationStatus.UNREAD.value
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Foreign Keys
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    return_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("return_orders.id"), nullable=True
    )
    promo_code_id: Mapped[int | None] = mapped_column(
        ForeignKey("promo_codes.id"), nullable=True
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="notifications")  # type: ignore # noqa: F821
    order: Mapped[Order | None] = relationship()  # type: ignore # noqa: F821
    return_order: Mapped[ReturnOrder | None] = relationship()  # type: ignore # noqa: F821
    promo_code: Mapped[PromoCode | None] = relationship()  # type: ignore # noqa: F821
