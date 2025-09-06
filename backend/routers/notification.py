from datetime import datetime, timezone
from typing import List

from db.database import get_db
from fastapi import APIRouter, Depends
from models.notification import Notification
from schemas.notification import MarkAsReadRequest, NotificationOut
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_id_via_session

notifications_router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@notifications_router.get("/latest", response_model=List[NotificationOut])
async def get_latest_notifications(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_user_id_via_session),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(5)
    )
    notifications = result.scalars().all()
    return notifications


@notifications_router.patch("/mark-read")
async def mark_notifications_as_read(
    payload: MarkAsReadRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_user_id_via_session),
):
    stmt = (
        update(Notification)
        .where(
            Notification.id.in_(payload.notification_ids),
            Notification.user_id == user_id,
        )
        .values(read_at=datetime.now(timezone.utc))
    )
    await db.execute(stmt)
    await db.commit()
    return {"success": True, "message": "Notifications marked as read"}
