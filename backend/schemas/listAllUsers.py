from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal
from models import user




class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    national_id: str
    wallet: Decimal
    status: user.UserStatus
    role: user.UserRole
    created_date: datetime

    class Config:
        from_attributes = True  # so it works with SQLAlchemy ORM