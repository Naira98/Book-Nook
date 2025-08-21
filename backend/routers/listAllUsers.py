from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.user import User, UserRole, UserStatus
from schemas.listAllUsers import UserOut
from typing import List
from utils.auth import manager_required
from schemas.addNewStaff import AddNewUserRequest, SuccessMessage
from core.auth import get_password_hash
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, BackgroundTasks

getUsers = APIRouter(prefix="/users", tags=["Users"])


@getUsers.post("/add", response_model=SuccessMessage)
async def add_new_staff(
    user_data: AddNewUserRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),

):
    print("Adding new - 🔥🔥🔥🔥 staff member")
    try:
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already exists")

        result = await db.execute(
            select(User).where(User.phone_number == user_data.phone_number)
        )
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Phone number already exists")
        result = await db.execute(
            select(User).where(User.national_id == user_data.national_id)
        )
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="National ID already exists")

        hashed_password = get_password_hash(user_data.password)

        new_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            password=hashed_password,
            status=UserStatus.ACTIVATED.value,
            phone_number=user_data.phone_number,
            national_id=user_data.national_id,
            role=UserRole.COURIER.value if user_data.role == "courier" else UserRole.EMPLOYEE.value,
        )

    except SQLAlchemyError as db_error:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    except HTTPException:
        raise  # Re-raise known HTTP exceptions (email/phone/national_id exists)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
    db.add(new_user)
    await db.commit()
    print("Adding new - 🔥🔥🔥🔥 staff member")
    await db.refresh(new_user)
    return SuccessMessage(
        success=True,
        status_code=201,
        message="User added successfully! 🎉"
    )


@getUsers.get("/get-all-users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(manager_required),  # restrict here
):  
    users = await db.execute(
        select(User).where(User.role != UserRole.MANAGER)  # Exclude managers if needed
    )
    print("Listing all users")
    return users.scalars().all()