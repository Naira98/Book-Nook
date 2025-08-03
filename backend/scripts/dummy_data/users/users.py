import json
from pathlib import Path
from sqlalchemy import select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)
from models.session import Session
from models.user import User
from core.auth import get_password_hash

current_dir = Path(__file__).resolve().parent


async def add_dummy_users(db: AsyncSession):
    print("Seeding users...")
    users_file = current_dir / "users.json"
    with open(users_file, "r") as file:
        dummy_user_data = json.load(file)

    users_to_add = []
    for user_data in dummy_user_data:
        result = await db.execute(select(User).where(User.email == user_data["email"]))
        if not result.scalars().first():
            # Hash password before adding
            user_data["password"] = get_password_hash(user_data["password"])
            users_to_add.append(User(**user_data))
            print(f"  - Preparing to add user: {user_data['email']}")
        else:
            print(f"  - User '{user_data['email']}' already exists, skipping.")

    if users_to_add:
        db.add_all(users_to_add)
        print(f"  - Adding {len(users_to_add)} new users to the session.")
    else:
        await db.commit()
        print("Users seeded successfully!")
