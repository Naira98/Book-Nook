import json
from pathlib import Path

from models.settings import Settings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_settings(db: AsyncSession):
    print("Seeding settings...")
    settings_file = current_dir / "settings.json"
    with open(settings_file, "r") as file:
        dummy_settings_data = json.load(file)

    settings_to_add = []
    for setting_data in dummy_settings_data:
        result = await db.execute(
            select(Settings).where(Settings.id == setting_data["id"])
        )

        if not result.scalars().first():
            settings_to_add.append(Settings(**setting_data))
            print("  - Preparing to add Settings data")
        else:
            print(f"  - Settings data already exists, skipping.")

    if settings_to_add:
        db.add_all(settings_to_add)
        print(f"  - Adding {len(settings_to_add)} new settings to the session.")
    else:
        print("  - No new settings to add.")
