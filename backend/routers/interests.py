
from fastapi import HTTPException, APIRouter
from RAG.data import get_recommendations, update_book_index, build_or_update_index_async
from schemas.interest import InterestInput
import logging

logger = logging.getLogger(__name__)

interest_router = APIRouter(prefix="/interests", tags=["Interests"])

@interest_router.post("/recommend")
async def recommend_endpoint(input: InterestInput):
    """
    Get book recommendations based on user interests
    """
    try:
        print(f"Getting recommendations for interests: {input.interests}")
        recommendations = await get_recommendations(input.interests)
        return {
            "status": "success",
            "recommendations": recommendations,
            "interests": input.interests
        }
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Recommendation failed: {str(e)}"
        )

@interest_router.post("/index_books")
async def index_books():
    """
    Update the book index with new data from the API
    """
    try:
        print("Updating book index...")
        result = await update_book_index()
        return result
    except Exception as e:
        logger.error(f"Index update failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Index update failed: {str(e)}"
        )

@interest_router.post("/rebuild_index")
async def rebuild_index():
    """
    Rebuild the entire book index (clears existing data)
    """
    try:
        print("Rebuilding book index...")
        await build_or_update_index_async(clear_existing=True)
        return {
            "status": "success",
            "message": "Book index rebuilt successfully"
        }
    except Exception as e:
        logger.error(f"Index rebuild failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Index rebuild failed: {str(e)}"
        )

@interest_router.get("/health")
async def health_check():
    """
    Health check endpoint for the RAG system
    """
    try:
        # Check if basic imports work
        from RAG.data import embeddings, llm
        
        # Check if environment variables are set
        import os
        if not os.getenv("OPENAI_API_KEY"):
            return {
                "status": "unhealthy",
                "message": "OpenAI API key not configured",
                "details": "Please set OPENAI_API_KEY environment variable"
            }
        
        if not os.getenv("SQLALCHEMY_DATABASE_URL"):
            return {
                "status": "unhealthy", 
                "message": "Database URL not configured",
                "details": "Please set SQLALCHEMY_DATABASE_URL environment variable"
            }
        
        # Try to get the RAG chain to check if everything is working
        from RAG.data import get_rag_chain
        try:
            chain = get_rag_chain()
            return {
                "status": "healthy",
                "message": "RAG system is operational",
                "details": "All components are working correctly"
            }
        except Exception as chain_error:
            return {
                "status": "degraded",
                "message": "RAG system partially operational",
                "details": f"Chain initialization failed: {str(chain_error)}"
            }
            
    except ImportError as e:
        return {
            "status": "unhealthy",
            "message": "RAG dependencies not available",
            "details": f"Import error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": "RAG system is not healthy",
            "details": str(e)
        }