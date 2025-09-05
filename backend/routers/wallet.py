from typing import Annotated, List

import stripe
from crud.wallet import (
    create_checkout_session_crud,
    get_transactions_crud,
    payment_success_crud,
)
from db.database import get_db
from fastapi import APIRouter, Depends, Query
from models.user import User
from schemas.wallet import CreateCheckoutRequest, TransactionSchema
from settings import settings
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_id_via_session, get_user_via_session

wallet_router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"],
)

if not settings.STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY environment variable not set.")

stripe.api_key = settings.STRIPE_SECRET_KEY


@wallet_router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_data: CreateCheckoutRequest,
    user: Annotated[User, Depends(get_user_via_session)],
    db: AsyncSession = Depends(get_db),
):
    return await create_checkout_session_crud(db, user, checkout_data)


@wallet_router.get("/payment-success")
async def payment_success(
    session_id: Annotated[str, Query()], db: AsyncSession = Depends(get_db)
):
    return await payment_success_crud(session_id, db)


@wallet_router.get("/transactions", response_model=List[TransactionSchema])
async def get_transactions(
    user_id: int = Depends(get_user_id_via_session), db: AsyncSession = Depends(get_db)
):
    return await get_transactions_crud(user_id, db)
