from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from utils.auth import get_user_via_session
from crud.user_interests import update_user_interests, get_user_interests
from schemas.user_interests import InterestsRequest, InterestsResponse
from models.user import User
from RAG.data import get_recommendations
from utils.rag import extract_and_parse_json

# Router for handling user interests
router = APIRouter(
    prefix="/api/interests",
    tags=["Interests"],
)


@router.put("/", response_model=InterestsResponse)
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

@router.get("/recommend")
async def recommend_for_current_user(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_user_via_session),
):
    """
    Return book recommendations for the current user based on their saved interests.
    """
    interests = current_user.interests
    print(f"Getting recommendations for interests: {interests} hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")

    recommendations = await get_recommendations(interests)
    if not recommendations:
        raise HTTPException(status_code=404, detail="No recommendations found")

    return {
        "status": "success",
        "recommendations": extract_and_parse_json(recommendations),
        "interests": interests,
    }
