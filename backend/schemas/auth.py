from decimal import Decimal
from typing import Literal

from models.user import UserRole
from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class LoginRequest(UserBase):
    password: str


class LoginResponse(UserBase):
    id: int
    first_name: str
    last_name: str
    phone_number: str
    wallet: Decimal
    role: UserRole
    interests: str | None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


# JWT token response
class Token(BaseModel):
    token: str
    token_type: Literal["bearer"] = "bearer"


# JWT token data (payload inside JWT)
class TokenData(BaseModel):
    id: int
    role: str



class ForgetPasswordRequest(UserBase):
    pass


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class MessageResponse(BaseModel):
    message: str


class ResetForegetPassword(BaseModel):
    reset_token: str
    new_password: str
    confirm_password: str


class SuccessMessage(BaseModel):
    success: bool
    status_code: int
    message: str
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: str | None = None
    national_id: str | None = None
class RegisterResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str | None = None
    national_id: str | None = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
class EmailVerificationResponse(BaseModel):
    message: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class EmailVerificationRequest(BaseModel):
    token: str

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)