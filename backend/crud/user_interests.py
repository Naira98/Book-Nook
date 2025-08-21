from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User


async def update_user_interests(db: AsyncSession, user_id: int, interests: list[str]):
    # Query user by ID
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None

    # Update interests (store as comma-separated string)
    user.interests = ",".join(interests) if interests else None
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_interests(db: AsyncSession, user_id: int):
    # Fetch user by ID and return
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
