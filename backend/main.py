import os
import sys
from contextlib import asynccontextmanager

from core.cloudinary import init_cloudinary
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from routers.auth import auth_router
from routers.book import book_router
from routers.cart import cart_router
from routers.order import order_router
from routers.promo_code import promo_code_router
from routers.websocket import websocket_router
from routers.return_order import return_order_router
from settings import settings

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
api_router.include_router(cart_router)
api_router.include_router(promo_code_router)
api_router.include_router(order_router)
api_router.include_router(websocket_router)
api_router.include_router(return_order_router)


app.include_router(api_router)
