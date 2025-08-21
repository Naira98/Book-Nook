from pydantic import BaseModel, EmailStr, constr
from typing import Literal

class AddNewUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    national_id: constr(min_length=14, max_length=14)  # Adjust if needed
    phone_number: str
    password: str
    role: Literal["employee", "courier"]   # restrict roles

class AddNewUserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    national_id: constr(min_length=14, max_length=14)
    phone_number: str
    role: str
    message: str = "User created successfully"

class SuccessMessage(BaseModel):
    success: bool
    status_code: int
    message: str

    class Config:
        orm_mode = True  # Enable ORM mode for compatibility with SQLAlchemy models