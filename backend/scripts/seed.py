import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from scripts.dummy_data import (
    add_dummy_users,
    add_dummy_authors,
    add_dummy_categories,
    add_dummy_books,
    add_dummy_book_details,
    add_dummy_cart_items,
    add_dummy_promo_codes,
    add_dummy_orders,
    add_dummy_return_orders,
    add_dummy_purchase_orders,
    add_dummy_borrow_orders,
    add_dummy_settings,
)

from settings import settings


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
        await add_dummy_users(db)
        await add_dummy_authors(db)
        await add_dummy_categories(db)
        await add_dummy_books(db)
        await add_dummy_book_details(db)
        await add_dummy_cart_items(db)
        await add_dummy_promo_codes(db)
        await add_dummy_orders(db)
        await add_dummy_return_orders(db)
        await add_dummy_purchase_orders(db)
        await add_dummy_borrow_orders(db)
        await add_dummy_settings(db)
        await db.commit()
        print("\nAll data committed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    print("--- Starting database seeding process ---")
    asyncio.run(seed_data())
    print("--- Database seeding finished ---")
