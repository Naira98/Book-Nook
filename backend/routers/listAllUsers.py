from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from models.user import User
from schemas.listAllUsers import UserOut
from typing import List
from utils.only_manager import manager_required

getUsers = APIRouter(prefix="/users", tags=["Users"])


@getUsers.get("/get-all-users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(manager_required),  # restrict here
):  
    users = await db.execute(
        User.__table__.select()
    )
    print("Listing all users")
    return users.scalars().all()
