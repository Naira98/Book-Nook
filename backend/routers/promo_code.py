from typing import Annotated

from crud.promo_code import (
    apply_promo_code,
    create_promo_code,
    get_promo_codes,
    update_promo_code,
)
from db.database import get_db
from fastapi import APIRouter, Body, Depends, HTTPException, status
from schemas.promo_code import (
    ApplyPromoCode,
    PromoCodeCreate,
    PromoCodeUpdate,
    promoCodeSchema,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_id_via_session, manager_required

promo_code_router = APIRouter(
    prefix="/promo-codes",
    tags=["Promo Codes"],
)


@promo_code_router.post("/active", response_model=ApplyPromoCode)
async def apply_promo_code_to_cart(
    code: Annotated[str, Body(embed=True)],
    db: AsyncSession = Depends(get_db),
    _=Depends(get_user_id_via_session),
):
    return await apply_promo_code(code, db)


@promo_code_router.get("/", response_model=list[promoCodeSchema])
async def get_all_promo_codes(
    db: AsyncSession = Depends(get_db), _=Depends(manager_required)
):
    return await get_promo_codes(db)


@promo_code_router.post(
    "/", response_model=promoCodeSchema, status_code=status.HTTP_201_CREATED
)
async def create_new_promo_code(
    promo_code: PromoCodeCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(manager_required),
):
    return await create_promo_code(db, promo_code)


@promo_code_router.patch("/{promo_code_id}", response_model=promoCodeSchema)
async def update_existing_promo_code(
    promo_code_id: int,
    promo_code_data: PromoCodeUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(manager_required),
):
    updated_promo_code = await update_promo_code(db, promo_code_id, promo_code_data)
    if not updated_promo_code:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return updated_promo_code
