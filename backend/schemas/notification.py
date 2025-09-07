from datetime import datetime
from typing import List, Optional

from models.notification import NotificationType
from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: int
    type: NotificationType
    data: dict
    created_at: datetime
    read_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class MarkAsReadRequest(BaseModel):
    notification_ids: List[int]


class NotificationRequest(BaseModel):
    user_id: int
    type: NotificationType
    data: dict
