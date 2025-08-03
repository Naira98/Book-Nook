import json
from pathlib import Path
from sqlalchemy import select
from models.order import Order
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

current_dir = Path(__file__).resolve().parent

async def add_dummy_orders(db: AsyncSession):
    print("Seeding orders...")
    orders_file = current_dir / "orders.json"
    with open(orders_file, "r") as file:
        dummy_orders_data = json.load(file)

    orders_to_add = []
    for order_to_add in dummy_orders_data:
        result = await db.execute(select(Order).where(Order.id == order_to_add["id"]))
        if not result.scalars().first():
            
            # Convert 'created_at' string to a datetime object
            if isinstance(order_to_add["created_at"], str):
               order_to_add["created_at"] = datetime.strptime(
                    order_to_add["created_at"], "%Y-%m-%dT%H:%M:%SZ"
                )

            # Convert 'pick_up_date' string to a datetime object, if it exists
            if order_to_add["pick_up_date"] and isinstance(order_to_add["pick_up_date"], str):
                order_to_add["pick_up_date"] = datetime.strptime(
                    order_to_add["pick_up_date"], "%Y-%m-%dT%H:%M:%SZ"
                )

            orders_to_add.append(Order(**order_to_add))
            print(f"  - Preparing to add Order for user id: {order_to_add['user_id']}")
        else:
            print(
                f"  - Order for user id: {order_to_add['user_id']} already exists, skipping."
            )

    db.add_all(orders_to_add)
    print(f"  - Adding {len(orders_to_add)} new orders to the session.")
