import json
import logging
import os
import sys
from contextlib import asynccontextmanager
from decimal import Decimal

from core.cloudinary import init_cloudinary
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
# from RAG.data import ensure_vector_store_initialized
from routers.auth import auth_router
from routers.book import book_router
from routers.cart import cart_router
from routers.interests import interest_router
# from routers.list_all_users import get_users
from routers.manager import manager_router
from routers.order import order_router
from routers.promo_code import promo_code_router
from routers.return_order import return_order_router
from routers.wallet import wallet_router
from routers.websocket import websocket_router
from routers.listAllUsers import getUsers 
from routers.addNewStaff import add_new_staff
from settings import settings

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__))))

load_dotenv()

logger = logging.getLogger(__name__)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super().default(o)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Logic here will run before the application starts receiving requests.
    init_cloudinary()
    print("Application startup...", "🚀🚀🚀")
    # ensure_vector_store_initialized()
    print("Vector store initialized successfully!", "✌️✌️✌️")
    # RAG system will be initialized lazily on first use
    print("RAG system will initialize on first use")

    yield

    # Logic here will run after the application finishes handling requests.
    print("Application shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    json_encoder=CustomJSONEncoder,
)


api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(book_router)
api_router.include_router(cart_router)
api_router.include_router(promo_code_router)
api_router.include_router(order_router)
api_router.include_router(interest_router)
api_router.include_router(websocket_router)
api_router.include_router(wallet_router)
api_router.include_router(return_order_router)
api_router.include_router(getUsers)
# api_router.include_router(get_users)
api_router.include_router(manager_router)
api_router.include_router(interest_router)

app.include_router(api_router)
