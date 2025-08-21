import asyncio
import json
import os
import sys
from pathlib import Path
from tempfile import SpooledTemporaryFile
from typing import BinaryIO, cast

from fastapi import UploadFile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.cloudinary import init_cloudinary, upload_image
from models.book import Book
from scripts.dummy_data import (
    add_dummy_books,
)
from settings import settings
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

current_dir = Path(__file__).resolve().parent
print(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")), "🔥")
init_cloudinary()


def local_file_to_uploadfile(path: Path) -> UploadFile:
    # Create a temporary file in memory
    temp_file = SpooledTemporaryFile()

    # Copy the local file into it
    print(path, "✨✨✨")
    with open(path, "rb") as f:
        temp_file.write(f.read())

    # Reset file pointer to the beginning
    temp_file.seek(0)

    # Use provided filename or extract from path
    filename = path.name

    # Wrap it as UploadFile
    return UploadFile(file=cast(BinaryIO, temp_file), filename=filename)


async def upload_dummy_books(db: AsyncSession):
    books_file = current_dir / "dataset" / "updated_with_publish_year.json"
    print("hello".lower() in "Hello from xD planet?".lower())
    with open(books_file, "r") as file:
        counter = 0
        books_to_add = []
        dummy_books_data = json.load(file)
        for book_data in dummy_books_data:
            img_url = book_data["img_paths"]
            title = book_data["name"]
            author = book_data["author"]
            price = book_data["price"]
            category = book_data["category"]
            description = book_data["description"]
            publish_year = book_data["publish_year"]

            print(book_data, "✨✨✨✨✨✨✨✨✨")
            upload_file = local_file_to_uploadfile(current_dir / img_url)
            url = await upload_image(upload_file)
            books_to_add.append(
                Book(
                    title=title,
                    author_id=author,
                    price=price,
                    category_id=int(category),
                    description=description,
                    publish_year=int(publish_year),
                    cover_img=url,
                )
            )
            # print(url, "🔥🔥🔥", counter)
            counter += 1
        print(books_to_add)
        db.add_all(books_to_add)
    pass


async def seed_data():
    if not settings.DATABASE_URL:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please configure it in your .env file."
        )

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(
        bind=engine, expire_on_commit=False, class_=AsyncSession
    )
    async with AsyncSessionLocal() as db:
        # await add_dummy_books(db)
        await upload_dummy_books(db)
        await db.commit()
        print("\nAll data committed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    print("--- Starting database seeding process ---")
    asyncio.run(seed_data())
    print("--- Database seeding finished ---")
