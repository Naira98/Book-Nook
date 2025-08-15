from decimal import Decimal
from typing import Annotated, List

import stripe
from db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from models.transaction import Transaction, TransactionType
from models.user import User
from schemas.wallet import CreateCheckoutRequest, TransactionSchema
from settings import settings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse
from utils.auth import get_user_by_id, get_user_id_via_session, get_user_via_session

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
    try:
        # Stripe will automatically replace {CHECKOUT_SESSION_ID} with the actual session ID.
        # Double curly braces {{...}} to escape the Stripe placeholder
        success_url = f"{settings.SERVER_DOMAIN}/wallet/payment-success?session_id={{CHECKOUT_SESSION_ID}}"  # Backend
        cancel_url = f"{settings.APP_HOST}/checkout/cancel"  # Frontend

        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price_data": {
                        "currency": "egp",
                        "unit_amount": checkout_data.amount,  # Amount is expected in piasters (e.g., 100 for 1 EGP)
                        "product_data": {
                            "name": "Wallet Top-up",
                            "description": f"Add EGP {checkout_data.amount / 100:.2f} to your e-wallet",
                        },
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            # Pass the user_id as metadata to retrieve it in the success endpoint
            metadata={"user_id": str(user.id)},
        )

        user.stripe_session_id = checkout_session.id

        await db.commit()
        await db.refresh(user)

        return {"url": checkout_session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe Error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@wallet_router.get("/payment-success")
async def payment_success(
    session_id: Annotated[str, Query()], db: AsyncSession = Depends(get_db)
):
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.status == "complete":
            user_id = session.get("metadata", {}).get("user_id")
            amount_total_piasters = session.get("amount_total")

            if amount_total_piasters is None:
                print(
                    f"Payment success received but amount_total is None for session {session.id}. Skipping wallet update."
                )
                raise HTTPException(
                    status_code=400, detail="Payment amount not found in session data."
                )

            if not user_id:
                print(
                    f"Payment success received without user_id in metadata for session {session.id}. Skipping wallet update."
                )
                raise HTTPException(
                    status_code=400,
                    detail="User ID not found in payment session metadata.",
                )

            try:
                user = await get_user_by_id(int(user_id), db)

                if user is None:
                    raise HTTPException(
                        status_code=404,
                        detail="User is not found",
                    )

                if user.stripe_session_id != session_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Stripe session isn't compatible with user's session",
                    )

                amount_egp_pounds = Decimal(amount_total_piasters) / Decimal(100)

                user.stripe_session_id = None
                user.wallet += amount_egp_pounds

                new_transaction = Transaction(
                    amount=amount_egp_pounds,
                    transaction_type=TransactionType.ADDING.value,
                    description="Wallet top-up via Stripe",
                    user_id=user.id,
                )
                db.add(new_transaction)

                await db.commit()

                return RedirectResponse(
                    url=f"{settings.APP_HOST}/checkout-success", status_code=302
                )
            except Exception as e:
                await db.rollback()
                raise HTTPException(
                    status_code=500, detail=f"Failed to update wallet balance: {e}"
                )
        else:
            return RedirectResponse(url=f"{settings.APP_HOST}/cancel", status_code=302)
    except stripe.StripeError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Stripe Error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@wallet_router.get("/transactions", response_model=List[TransactionSchema])
async def get_transactions(
    user_id: int = Depends(get_user_id_via_session), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
    )

    result = await db.execute(stmt)
    transactions = result.scalars().all()

    return transactions
