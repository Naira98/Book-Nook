from datetime import datetime, timedelta, timezone

from core.auth import (
    create_token_generic,
    decode_token_generic,
    get_password_hash,
    send_email,
    verify_password,
)
from db.database import get_db
from fastapi import APIRouter, BackgroundTasks, Depends, Response, status, HTTPException
from fastapi.responses import JSONResponse
from models.session import Session
from models.user import UserStatus
from nanoid import generate
from schemas.auth import (
    ForgetPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    ResetForegetPassword,
    SuccessMessage,
    EmailVerificationRequest,  # Added missing import
)
from settings import settings
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from utils.auth import get_user_by_email

from models.user import User, UserRole

auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)

@auth_router.post("/register", response_model=SuccessMessage)
async def register(
    user_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    try:
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Email already exists")

        result = await db.execute(select(User).where(User.phone_number == user_data.phone_number))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Phone number already exists")
        result = await db.execute(select(User).where(User.national_id == user_data.national_id))
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
            role=UserRole.CLIENT.value,  # Default role
        )
      
    except SQLAlchemyError as db_error:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    except HTTPException:
        raise  # Re-raise known HTTP exceptions (email/phone/national_id exists)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    # Generate verification token
    try:
        token, token_expires_at = create_token_generic(
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
        raise HTTPException(status_code=500, detail=f"Token generation failed: {str(e)}")
# shroukkhamis239@gmail.com
    # Send verification email
    try:
        verification_link = f"{settings.APP_HOST}/verify-email?token={token}"
        email_body = f"""
            <h2>Welcome {new_user.first_name}!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="{verification_link}">Verify Email</a>
        """
        await send_email(
            user_email=new_user.email,
            subject="Verify Your Email",
            html_body=email_body,
            background_tasks=background_tasks,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

    return {
        "success": True,
        "status_code": 201,
        "message": "User registered successfully! Verification email sent.",
    }


@auth_router.post("/verify-email", response_model=SuccessMessage)
async def verify_email(
    email_verification: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
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
        user.status = UserStatus.ACTIVATED.value
        user.email_verified = True  # if you have this field
        user.email_verification_token = None 

        await db.commit()

        return {
            "success": True,
            "status_code": 200,
            "message": "Email verified successfully."
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@auth_router.post("/login", response_model=LoginResponse)
async def login(
    user_login: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)
):
    # """ GENERATE DUMMY USER DATA FOR TESTING PURPOSE """
    # dummy_user = User(
    #     **{
    #         "first_name": "test",
    #         "last_name": "test",
    #         "email": "test@test.com",
    #         "password": get_password_hash("test"),
    #         "status": UserStatus.ACTIVATED.value,
    #         "role": UserRole.CLIENT.value,
    #         "national_id": "12345678901234",
    #         "phone_number": "12345678901",
    #     }
    # )
    # db.add(dummy_user)
    # await db.commit()
    # await db.refresh(dummy_user)
    # print("ADDED DUMMY USER 🤡🤡🤡🤡🤡", dummy_user.id)

    user = await get_user_by_email(user_login.email, db)

    if not user or not verify_password(user_login.password, user.password):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "Incorrect email or password"},
        )

    if user.status.value == UserStatus.DEACTIVATED.value:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "User is not activated"},
        )

    elif user.status.value == UserStatus.BLOCKED.value:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "User is blocked"},
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

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        expires=session_expires_at,
    )

    return user


@auth_router.post("/forget-password", response_model=MessageResponse)
async def forget_password(
    fpr: ForgetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_email(fpr.email, db)

    if user is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid Email address"},
        )

    forget_password_token, reset_token_expires_at = create_token_generic(
        user.email,
        settings.FORGET_PASSWORD_SECRET_KEY,
        settings.ALGORITHM,
        "FORGET_PASSWORD_SECRET_KEY",
        settings.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,
    )

    user.forget_password_token = forget_password_token
    user.reset_token_expires_at = reset_token_expires_at

    await db.commit()

    reset_link = f"{settings.APP_HOST}{settings.RESET_PASSWORD_URL}/{forget_password_token}"

    html_body = f"""
        <html>
            <body>
                <p>You have requested to reset your password. Click the link below to reset it:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>This link will expire in {settings.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES} minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>
        """

    await send_email(user.email, html_body, "Password Reset Request", background_tasks)

    return {"message": "Password reset email has been sent."}


@auth_router.post("/reset-password", response_model=SuccessMessage)
async def reset_password(rfp: ResetForegetPassword, db: AsyncSession = Depends(get_db)):
    if rfp.new_password != rfp.confirm_password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "New password and confirm password are not same."},
        )

    info = decode_token_generic(
        rfp.reset_token,
        settings.FORGET_PASSWORD_SECRET_KEY,
        settings.ALGORITHM,
        "FORGET_PASSWORD_SECRET_KEY",
    )
    if info is None:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Invalid Password Reset Payload"},
        )

    user = await get_user_by_email(info, db)

    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found"},
        )

    if (
        user.reset_token_expires_at is None
        or user.reset_token_expires_at < datetime.now()
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Reset token has expired"},
        )

    hashed_password = get_password_hash(rfp.new_password)

    user.password = hashed_password
    user.forget_password_token = None
    user.reset_token_expires_at = None

    # remove all sessions after reseting password
    await db.execute(delete(Session).where(Session.user_id == user.id))

    await db.commit()
    return {
        "success": True,
        "status_code": status.HTTP_200_OK,
        "message": "Password Rest Successfull!",
    }
