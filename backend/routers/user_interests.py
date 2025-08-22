from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from utils.auth import get_user_via_session
from crud.user_interests import update_user_interests, get_user_interests
from schemas.user_interests import InterestsRequest, InterestsResponse
from models.user import User

# Router for handling user interests
interests_router = APIRouter(
    prefix="/api/interests",
    tags=["Interests"],
)


@interests_router.put("/", response_model=InterestsResponse)
async def set_user_interests(
    request: InterestsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_user_via_session),
):
    # Update user interests in DB
    user = await update_user_interests(db, current_user.id, request.interests)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return success response
    return InterestsResponse(
        message="Interests updated successfully",
        interests=request.interests,
    )


@interests_router.get("/", response_model=InterestsResponse)
async def fetch_user_interests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_user_via_session),
):
    # Fetch user interests from DB
    user = await get_user_interests(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return success response with interests (split by comma if stored as string)
    return InterestsResponse(
        message="Interests fetched successfully",
        interests=user.interests.split(",") if user.interests else [],
    )
