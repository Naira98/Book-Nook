import logging

from db.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.book import Book
from RAG.data import get_recommendations
from schemas.interest import InterestInput
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

interest_router = APIRouter(prefix="/interests", tags=["Interests"])


@interest_router.post("/recommend")
async def recommend_endpoint(input: InterestInput, db: AsyncSession = Depends(get_db)):
    """
    Get book recommendations based on user interests
    """
    try:
        print(
            f"Getting recommendations for interests 😂😂😂: {' or '.join(input.interests)}"
        )
        recommendations = await get_recommendations(" or ".join(input.interests))
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


@interest_router.get("/health")
async def health_check():
    """
    Health check endpoint for the RAG system
    """
    try:
        # Check if basic imports work

        # Check if environment variables are set
        import os

        if not os.getenv("OPENAI_API_KEY"):
            return {
                "status": "unhealthy",
                "message": "OpenAI API key not configured",
                "details": "Please set OPENAI_API_KEY environment variable",
            }

        if not os.getenv("SQLALCHEMY_DATABASE_URL"):
            return {
                "status": "unhealthy",
                "message": "Database URL not configured",
                "details": "Please set SQLALCHEMY_DATABASE_URL environment variable",
            }

        # Try to get the RAG chain to check if everything is working

        try:
            return {
                "status": "healthy",
                "message": "RAG system is operational",
                "details": "All components are working correctly",
            }
        except Exception as chain_error:
            return {
                "status": "degraded",
                "message": "RAG system partially operational",
                "details": f"Chain initialization failed: {str(chain_error)}",
            }

    except ImportError as e:
        return {
            "status": "unhealthy",
            "message": "RAG dependencies not available",
            "details": f"Import error: {str(e)}",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": "RAG system is not healthy",
            "details": str(e),
        }
