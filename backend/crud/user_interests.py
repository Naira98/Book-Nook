from typing import List
from sqlalchemy.future import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User


# async def update_user_interests(db: AsyncSession, user_id: int, interests: list[str]):
#     # Query user by ID
#     result = await db.execute(select(User).where(User.id == user_id))
#     user = result.scalar_one_or_none()
#     if not user:
#         return None

#     # Update interests (store as comma-separated string)
#     user.interests = ",".join(interests) if interests else None
#     await db.commit()
#     await db.refresh(user)
#     return user


# async def get_user_interests(db: AsyncSession, user_id: int):
#     # Fetch user by ID and return
#     result = await db.execute(select(User).where(User.id == user_id))
#     return result.scalar_one_or_none()



async def update_user_interests(
    db: AsyncSession, 
    user_id: int, 
    new_interests: List[str]
) -> None:
    """Update user's interests as a comma-separated string"""
    # Clean and format interests
    cleaned_interests = [interest.strip().title() for interest in new_interests]
    interests_string = ", ".join(cleaned_interests)
    
    # Update the user
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(interests=interests_string)
    )
    await db.execute(stmt)
    await db.commit()


async def get_user_interests(db: AsyncSession, user_id: int) -> List[str]:
    """Get user's interests as a list"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.interests:
        return []
    
    # Split comma-separated string into list and clean
    return [interest.strip() for interest in user.interests.split(',') if interest.strip()]


async def merge_interests(
    current_interests: List[str], 
    new_interests: List[str]
) -> List[str]:
    """Merge current and new interests, removing duplicates"""
    # Normalize all interests (case-insensitive comparison)
    current_normalized = {interest.lower().strip() for interest in current_interests}
    
    # Remove duplicates from new interests
    unique_new_interests = [
        interest for interest in new_interests 
        if interest.lower().strip() not in current_normalized
    ]
    
    # Combine and return
    return current_interests + unique_new_interests