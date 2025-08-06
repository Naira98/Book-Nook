import json
from pathlib import Path

from models.settings import PromoCode
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_promocodes(db: AsyncSession):
    print("Seeding promocodes...")
    promocodes_file = current_dir / "promocodes.json"
    with open(promocodes_file, "r") as file:
        dummy_promocodes_data = json.load(file)

    promocodes_to_add = []
    for promocode in dummy_promocodes_data:
        result = await db.execute(
            select(PromoCode).where(PromoCode.code == promocode["code"])
        )
        if not result.scalars().first():
            promocodes_to_add.append(PromoCode(**promocode))
            print(f"  - Preparing to add promo code: {promocode['code']}")
        else:
            print(f"  - Promo code '{promocode['code']}' already exists, skipping.")

    if promocodes_to_add:
        db.add_all(promocodes_to_add)
        print(f"  - Adding {len(promocodes_to_add)} new promocodes to the session.")
    else:
        print("  - No new promocodes to add.")
