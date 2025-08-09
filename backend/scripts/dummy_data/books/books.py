import json
from pathlib import Path

from models.book import Book
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_books(db: AsyncSession):
    print("Seeding books...")
    books_file = current_dir / "books.json"
    with open(books_file, "r") as file:
        dummy_books_data = json.load(file)

    books_to_add = []
    for book_data in dummy_books_data:
        result = await db.execute(select(Book).where(Book.title == book_data["title"]))
        if not result.scalars().first():
            books_to_add.append(Book(**book_data))
            print(f"  - Preparing to add book: {book_data['title']}")
        else:
            print(f"  - book '{book_data['title']}' already exists, skipping.")

    if books_to_add:
        db.add_all(books_to_add)
        print(f"  - Adding {len(books_to_add)} new books to the session.")
    else:
        print("  - No new books to add.")
