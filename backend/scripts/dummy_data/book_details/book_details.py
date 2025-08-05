import json
from pathlib import Path

from models.book import BookDetails
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_book_details(db: AsyncSession):
    print("Seeding book_details...")
    book_details_file = current_dir / "book_details.json"
    with open(book_details_file, "r") as file:
        dummy_book_details_data = json.load(file)

    book_details_to_add = []
    for book_details_data in dummy_book_details_data:
        result = await db.execute(
            select(BookDetails).where(
                BookDetails.book_id == book_details_data["book_id"]
                and BookDetails.status == book_details_data["status"]
            )
        )
        if not result.scalars().first():
            book_details_to_add.append(BookDetails(**book_details_data))
            print(
                f"  - Preparing to add book_details for book id: {book_details_data['book_id']}"
            )
        else:
            print(
                f"  - book_details for book id'{book_details_data['book_id']}' already exists, skipping."
            )

    if book_details_to_add:
        db.add_all(book_details_to_add)
        print(f"  - Adding {len(book_details_to_add)} new book_details to the session.")
    else:
        print("  - No new book_details to add.")
