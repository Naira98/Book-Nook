from typing import Optional, Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.settings import PromoCode
from schemas.promo_code import PromoCodeCreate, PromoCodeUpdate


async def get_promo_codes(db: AsyncSession) -> Sequence[PromoCode]:
    """Get all active promo codes."""
    stmt = select(PromoCode).where(PromoCode.is_active)
    result = await db.execute(stmt)
    promo_codes = result.scalars().all()
    return promo_codes


async def create_promo_code(
    db: AsyncSession, promo_code_data: PromoCodeCreate
) -> PromoCode:
    """Create a new promo code."""
    new_promo_code = PromoCode(**promo_code_data.model_dump())
    db.add(new_promo_code)
    await db.commit()
    await db.refresh(new_promo_code)
    return new_promo_code


async def update_promo_code(
    db: AsyncSession, promo_code_id: int, promo_code_data: PromoCodeUpdate
) -> Optional[PromoCode]:
    existing_promo_code = await db.get(PromoCode, promo_code_id)

    if existing_promo_code:
        # exclude_unset=True ensures we only update fields that were provided
        update_data = promo_code_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_promo_code, key, value)

        await db.commit()
        await db.refresh(existing_promo_code)

    return existing_promo_code