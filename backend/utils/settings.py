from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.settings import Settings


async def get_settings(db: AsyncSession):
    result = await db.execute(select(Settings).where(Settings.id == 1))
    settings = result.scalars().first()
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found in database.",
        )
    return settings
