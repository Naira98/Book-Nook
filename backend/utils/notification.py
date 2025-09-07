import os
import traceback

from core.websocket import webSocket_connection_manager
from fastapi import Header, HTTPException, status
from models.notification import Notification, NotificationType
from sqlalchemy.ext.asyncio import AsyncSession


async def send_notification(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    data: dict,
):
    try:
        notification = Notification(
            user_id=user_id,
            type=type,
            data=data,
        )

        db.add(notification)
        await db.commit()
        await db.refresh(notification)

        serialized_notification = {
            "id": notification.id,
            "user_id": notification.user_id,
            "type": notification.type.value,
            "data": notification.data,
            "created_at": notification.created_at.isoformat(),
            "read_at": (
                notification.read_at.isoformat() if notification.read_at else None
            ),
        }

        await webSocket_connection_manager.send_personal_message(
            serialized_notification, user_id
        )
    except Exception as e:
        print(f"An error occurred while sending notification for user {user_id}: {e}")
        traceback.print_exc()
        await db.rollback()


async def get_scheduler_secret(
    x_scheduler_secret: str = Header(..., alias="X-Scheduler-Secret"),
):
    SECRET_KEY = os.getenv("SCHEDULER_SECRET")
    if x_scheduler_secret != SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid scheduler secret key",
        )
    return True
