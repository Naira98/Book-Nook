import json
from pathlib import Path

from models.order import PurchaseOrderBook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

current_dir = Path(__file__).resolve().parent


async def add_dummy_purchase_orders(db: AsyncSession):
    print("Seeding purchase_orders...")
    purchase_orders_file = current_dir / "purchase_orders.json"
    with open(purchase_orders_file, "r") as file:
        dummy_purchase_orders_data = json.load(file)

    purchase_orders_to_add = []
    for purchase_order_data in dummy_purchase_orders_data:
        result = await db.execute(
            select(PurchaseOrderBook).where(
                PurchaseOrderBook.id == purchase_order_data["id"]
            )
        )

        if not result.scalars().first():
            purchase_orders_to_add.append(PurchaseOrderBook(**purchase_order_data))
            print(
                f"  - Preparing to add purchase_order for user id : {purchase_order_data['user_id']}"
            )
        else:
            print(
                f"  - Purchase Order for user id: {purchase_order_data['user_id']} already exists, skipping."
            )

    if purchase_orders_to_add:
        db.add_all(purchase_orders_to_add)
        print(
            f"  - Adding {len(purchase_orders_to_add)} new purchase_orders to the session."
        )
    else:
        print("  - No new purchase_orders to add.")
