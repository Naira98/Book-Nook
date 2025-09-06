from core.websocket import webSocket_connection_manager
from models.notification import Notification, NotificationType
from sqlalchemy.ext.asyncio import AsyncSession


async def send_notification(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    data: dict,
):
    notification = Notification(
        user_id=user_id,
        type=type.value,
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
        "read_at": (notification.read_at.isoformat() if notification.read_at else None),
    }

    await webSocket_connection_manager.send_personal_message(
        serialized_notification, user_id
    )
