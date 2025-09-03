from datetime import datetime, timedelta, timezone
from typing import Tuple

from core.auth import (
    create_token_generic,
    decode_token_generic,
    get_password_hash,
    send_email,
    verify_password,
)
from core.templates import render_template
from fastapi import (
    BackgroundTasks,
    HTTPException,
    status,
)
from fastapi.responses import JSONResponse
from jose import ExpiredSignatureError, JWTError  # type: ignore
from models.session import Session
from models.user import User, UserRole, UserStatus
from nanoid import generate  # type: ignore
from schemas.auth import (
    EmailVerificationRequest,
    ForgetPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from settings import settings
from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_by_email


async def register_crud(
    user_data: RegisterRequest, background_tasks: BackgroundTasks, db: AsyncSession
):
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
            status=UserStatus.DEACTIVATED.value,
            phone_number=user_data.phone_number,
            national_id=user_data.national_id,
            role=UserRole.CLIENT.value,
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

    try:
        token = create_token_generic(
            new_user.email,
            settings.EMAIL_VERIFICATION_SECRET_KEY,
            settings.ALGORITHM,
            "EMAIL_VERIFICATION_SECRET_KEY",
            settings.EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES,
        )
        new_user.email_verification_token = token
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Token generation failed: {str(e)}"
        )

    verification_link = f"{settings.APP_HOST}/verify-email?token={token}"

    email_body = render_template(
        "emails/verify_email.html",
        first_name=new_user.first_name,
        verification_link=verification_link,
    )

    try:
        await send_email(
            new_user.email,
            "Verify Your Book Nook Account Email",
            email_body,
            background_tasks,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send verification email: {str(e)}"
        )


async def verify_email_crud(
    email_verification: EmailVerificationRequest, db: AsyncSession
):
    try:
        # Decode the token to extract email
        email = decode_token_generic(
            email_verification.token,
            settings.EMAIL_VERIFICATION_SECRET_KEY,
            settings.ALGORITHM,
            "EMAIL_VERIFICATION_SECRET_KEY",
        )

        if not email:
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        # Fetch user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Validate that token matches the one stored in DB
        if user.email_verification_token != email_verification.token:
            raise HTTPException(status_code=400, detail="Invalid verification token")

        # Activate user and clear verification token
        user.status = UserStatus.ACTIVATED
        user.email_verified = True  # if you have this field
        # user.email_verification_token = None

        await db.commit()

    except HTTPException as e:
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


async def login_crud(
    login_data: LoginRequest, db: AsyncSession
) -> Tuple[str, datetime, User]:
    user = await get_user_by_email(login_data.email, db)

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if user.status.value == UserStatus.DEACTIVATED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is not activated"
        )

    if user.status.value == UserStatus.BLOCKED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is blocked"
        )

    session_token = generate(size=100)
    session_expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.SESSION_EXPIRE_MINUTES
    )

    new_session = Session(
        session=session_token, expires_at=session_expires_at, user_id=user.id
    )
    db.add(new_session)
    await db.commit()

    return session_token, session_expires_at, user


async def forget_password_crud(
    forget_password_data: ForgetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession,
):
    user = await get_user_by_email(forget_password_data.email, db)

    if user is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid Email address"},
        )

    forget_password_token = create_token_generic(
        user.email,
        settings.FORGET_PASSWORD_SECRET_KEY,
        settings.ALGORITHM,
        "FORGET_PASSWORD_SECRET_KEY",
        settings.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,
    )

    user.forget_password_token = forget_password_token

    await db.commit()

    reset_link = (
        f"{settings.APP_HOST}{settings.RESET_PASSWORD_URL}/{forget_password_token}"
    )

    email_body = render_template(
        "emails/reset_password.html",
        reset_link=reset_link,
        reset_token_expiration_minutes=settings.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,
    )

    await send_email(user.email, "Password Reset Request", email_body, background_tasks)


async def reset_password_crud(
    reset_password_data: ResetPasswordRequest, db: AsyncSession
):
    if reset_password_data.new_password != reset_password_data.confirm_password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "New password and confirm password are not same."},
        )

    try:
        info = decode_token_generic(
            reset_password_data.reset_token,
            settings.FORGET_PASSWORD_SECRET_KEY,
            settings.ALGORITHM,
            "FORGET_PASSWORD_SECRET_KEY",
        )
        if info is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": "Invalid password reset token."},
            )

    except ExpiredSignatureError:
        # The JWT library raises this specific error for expired tokens
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Password reset token has expired."},
        )
    except JWTError:
        # Catch any other generic JWT errors (e.g., malformed token)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid password reset token."},
        )

    user = await get_user_by_email(info, db)

    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found"},
        )

    hashed_password = get_password_hash(reset_password_data.new_password)

    user.password = hashed_password
    user.forget_password_token = None

    # remove all sessions after reseting password
    await db.execute(delete(Session).where(Session.user_id == user.id))

    await db.commit()


async def logout_crud(session_token: str | None, db: AsyncSession):
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active session found",
        )

    # Delete session from DB
    await db.execute(delete(Session).where(Session.session == session_token))
    await db.commit()
