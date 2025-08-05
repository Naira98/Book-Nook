import json
from pathlib import Path

from models.cart import Cart
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_cart_items(db: AsyncSession):
    print("Seeding cart_items...")
    cart_items_file = current_dir / "cart.json"
    with open(cart_items_file, "r") as file:
        dummy_cart_items_data = json.load(file)

    cart_items_to_add = []
    for cart_item in dummy_cart_items_data:
        result = await db.execute(
            select(Cart).where(
                Cart.book_details_id == cart_item["book_details_id"]
                and Cart.user_id == cart_item["user_id"]
            )
        )
        if not result.scalars().first():
            cart_items_to_add.append(Cart(**cart_item))
            print(f"  - Preparing to add cart item for user id: {cart_item['user_id']}")
        else:
            print(
                f"  - Cart item for user id '{cart_item['user_id']}' already exists, skipping."
            )

    if cart_items_to_add:
        db.add_all(cart_items_to_add)
        print(f"  - Adding {len(cart_items_to_add)} new cart_items to the session.")
    else:
        print("  - No new cart_items to add.")
