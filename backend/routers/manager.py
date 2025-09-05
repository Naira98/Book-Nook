from crud.manager import (
    add_new_staff_crud,
    get_manager_dashboard_stats_crud,
    list_all_users_crud,
    update_settings_crud,
)
from db.database import get_db
from fastapi import APIRouter, Depends
from models.user import User
from schemas.manager import (
    AddNewUserRequest,
    ManagerDashboardStats,
    SettingsResponse,
    SettingsUpdate,
    SuccessMessage,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import manager_required

manager_router = APIRouter(
    prefix="/manager",
    tags=["Manager"],
)


@manager_router.get("/dashboard-stats", response_model=ManagerDashboardStats)
async def get_manager_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _=Depends(manager_required),
):
    return await get_manager_dashboard_stats_crud(db)


@manager_router.patch(
    "/settings",
    response_model=SettingsResponse,
)
async def update_settings(
    settings_update: SettingsUpdate,
    _=Depends(manager_required),
    db: AsyncSession = Depends(get_db),
):
    return await update_settings_crud(db, settings_update)


@manager_router.post("/add-user", response_model=SuccessMessage)
async def add_new_staff(
    user_data: AddNewUserRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(manager_required),
):
    return await add_new_staff_crud(db, user_data)


@manager_router.get(
    "/get-all-users",
)
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(manager_required),
):
    return await list_all_users_crud(db)
