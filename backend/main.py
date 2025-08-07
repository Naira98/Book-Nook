import os
import sys
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from routers.auth import auth_router
from routers.order import order_router
from settings import settings
from routers.book import book_router
from core.cloudinary import init_cloudinary
from routers.websocket import websocket_router

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__))))

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Logic here will run before the application starts receiving requests.
    init_cloudinary()
    print("Application startup...")
    yield
    # Logic here will run after the application finishes handling requests.
    print("Application shutdown.")


app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)


api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(book_router)
api_router.include_router(order_router)

api_router.include_router(websocket_router)


app.include_router(api_router)
