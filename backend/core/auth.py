import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from schemas.auth import TokenData

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

# JWT Token
SECRET_KEY: str = "your-super-secret-key-that-you-should-change"
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


def create_access_token(
    data: TokenData, expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.model_dump()  # Converts the BaseModel to a dict

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode["exp"] = expire

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
