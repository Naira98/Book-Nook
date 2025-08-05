from models.user import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Cookie, HTTPException, status, Depends
from models.session import Session
from datetime import datetime
from datetime import timezone
from db.database import get_db


async def get_user_by_email(email: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_user_session(
    session_token: str | None = Cookie(None),
):
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token is required.",
        )
    return session_token


async def get_user_id(
    session_token: str = Depends(get_user_session),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Session).where(Session.session == session_token)
    result = await db.execute(stmt)
    session_data = result.scalars().first()
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token.",
        )
    if session_data.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired.",
        )
    return session_data.user_id


async def get_user(
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user_data = result.scalars().first()
    return user_data
