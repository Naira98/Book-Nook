from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from schemas.addNewStaff import AddNewUserRequest, AddNewUserResponse
from fastapi import HTTPException, status
from utils.hash_password import hash_password  # you need this

async def create_user(data: AddNewUserRequest, db: AsyncSession) -> AddNewUserResponse:
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        national_id=data.nationalId,
        phone_number=data.phoneNumber,
        password=hash_password(data.password),  # hash the password
        role=data.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return AddNewUserResponse(
        id=new_user.id,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email,
        phoneNumber=new_user.phone_number,
        role=new_user.role,
    )
