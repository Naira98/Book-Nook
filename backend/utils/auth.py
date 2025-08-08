from models.user import User, UserRole
from sqlalchemy import select
from sqlalchemy.orm import joinedload
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
    session_token: str = Depends(get_user_session),
    db: AsyncSession = Depends(get_db),
) -> User:
    stmt = (
        select(Session)
        .where(Session.session == session_token)
        .options(joinedload(Session.user))
    )
    result = await db.execute(stmt)
    session = result.scalars().first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token.",
        )

    if not session.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for this session.",
        )

    return session.user


async def is_staff(user: User = Depends(get_user)):
    if (
        user.role != UserRole.EMPLOYEE
        and user.role != UserRole.MANAGER
        and user.role != UserRole.COURIER
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )
    return user
