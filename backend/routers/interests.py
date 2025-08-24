import logging
import random

from db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models.book import Book
from models.user import User
from models.user_tracker import UserTracker
from RAG.data import get_recommendations
from schemas.interest import InterestInput
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from utils.auth import get_user_via_session

logger = logging.getLogger(__name__)

interest_router = APIRouter(prefix="/interests", tags=["Interests"])


@interest_router.get("/")
async def recommend_endpoint(
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    try:
        if not user.interests:
            raise HTTPException(
                status_code=400, detail="User has not set any interests"
            )

        interests = user.interests.split(", ")
        input = InterestInput(interests=interests)
        stmt = (
            select(UserTracker.category)
            .where(UserTracker.user_id == user.id)
            .order_by(UserTracker.id.desc())
            .limit(3)
        )
        result = await db.execute(stmt)
        latest_categories = [row for row in result.scalars().all()]

        # --- 3) Merge interests + latest categories ---
        combined_interests = list(set(interests + latest_categories))

        if not combined_interests:
            raise HTTPException(status_code=404, detail="No interests found")

        # --- 4) Pick 3 random interests ---
        chosen_interests = random.sample(
            combined_interests, min(3, len(combined_interests))
        )
        recommendations = await get_recommendations(" or ".join(chosen_interests))
        if not recommendations:
            raise HTTPException(status_code=404, detail="No recommendations found")
        ids = [r["id"] for r in recommendations]
        stmt = (
            select(Book)
            .options(
                selectinload(Book.author),
                selectinload(Book.category),
                selectinload(Book.book_details),
            )
            .where(Book.id.in_(ids))
        )
        result = await db.execute(stmt)
        result = result.scalars().all()

        return {
            "status": "success",
            "recommendations": result,
            "interests": input.interests,
        }
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


@interest_router.post("/")
async def add_interests(
    input: InterestInput,
    user: User = Depends(get_user_via_session),
    db: AsyncSession = Depends(get_db),
):
    user.interests = ", ".join(input.interests)

    try:
        await db.commit()
        return {"message": "Interests updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while saving interests: {e}",
        )
