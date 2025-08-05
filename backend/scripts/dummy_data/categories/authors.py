import json
from pathlib import Path

from models.book import Category
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_categories(db: AsyncSession):
    print("Seeding categories...")
    categories_file = current_dir / "categories.json"
    with open(categories_file, "r") as file:
        dummy_categories_data = json.load(file)

    categories_to_add = []
    for category_data in dummy_categories_data:
        result = await db.execute(
            select(Category).where(Category.name == category_data["name"])
        )
        if not result.scalars().first():
            categories_to_add.append(Category(**category_data))
            print(f"  - Preparing to add category: {category_data['name']}")
        else:
            print(f"  - Category '{category_data['name']}' already exists, skipping.")

    if categories_to_add:
        db.add_all(categories_to_add)
        print(f"  - Adding {len(categories_to_add)} new categories to the session.")
    else:
        print("  - No new categories to add.")
