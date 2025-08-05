import json
from pathlib import Path

from models.book import Author
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_authors(db: AsyncSession):
    print("Seeding authors...")
    authors_file = current_dir / "authors.json"
    with open(authors_file, "r") as file:
        dummy_authors_data = json.load(file)

    authors_to_add = []
    for author_data in dummy_authors_data:
        result = await db.execute(
            select(Author).where(Author.name == author_data["name"])
        )
        if not result.scalars().first():
            authors_to_add.append(Author(**author_data))
            print(f"  - Preparing to add author: {author_data['name']}")
        else:
            print(f"  - Author '{author_data['name']}' already exists, skipping.")

    if authors_to_add:
        db.add_all(authors_to_add)
        print(f"  - Adding {len(authors_to_add)} new authors to the session.")
    else:
        print("  - No new authors to add.")
