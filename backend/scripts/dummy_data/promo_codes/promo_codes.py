import json
from pathlib import Path

from models.settings import PromoCode
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_promo_codes(db: AsyncSession):
    print("Seeding promo_codes...")
    promo_codes_file = current_dir / "promo_codes.json"
    with open(promo_codes_file, "r") as file:
        dummy_promo_codes_data = json.load(file)

    promo_codes_to_add = []
    for promo_code in dummy_promo_codes_data:
        result = await db.execute(
            select(PromoCode).where(PromoCode.code == promo_code["code"])
        )
        if not result.scalars().first():
            promo_codes_to_add.append(PromoCode(**promo_code))
            print(f"  - Preparing to add promo code: {promo_code['code']}")
        else:
            print(f"  - Promo code '{promo_code['code']}' already exists, skipping.")

    if promo_codes_to_add:
        db.add_all(promo_codes_to_add)
        print(f"  - Adding {len(promo_codes_to_add)} new promo_codes to the session.")
    else:
        print("  - No new promo_codes to add.")
