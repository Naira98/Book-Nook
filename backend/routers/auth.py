from crud.auth import (
    forget_password_crud,
    login_crud,
    logout_crud,
    register_crud,
    reset_password_crud,
    verify_email_crud,
)
from db.database import get_db
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Cookie,
    Depends,
    Response,
    status,
)
from schemas.auth import (
    EmailVerificationRequest,
    ForgetPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    SuccessMessage,
)
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_via_session

auth_router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@auth_router.get("/me", response_model=LoginResponse)
async def get_current_user(
    user: str = Depends(get_user_via_session),
):
    return user


@auth_router.post("/register", response_model=SuccessMessage)
async def register(
    user_data: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    await register_crud(user_data, background_tasks, db)

    return {
        "success": True,
        "status_code": 201,
        "message": "User registered successfully! Verification email sent.",
    }


@auth_router.post("/verify-email", response_model=SuccessMessage)
async def verify_email(
    email_verification: EmailVerificationRequest, db: AsyncSession = Depends(get_db)
):
    await verify_email_crud(email_verification, db)

    return {
        "success": True,
        "status_code": 200,
        "message": "Email verified successfully.",
    }


@auth_router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    session_token, session_expires_at, user = await login_crud(login_data, db)

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        expires=session_expires_at,
    )

    return user


@auth_router.post("/forget-password", response_model=MessageResponse)
async def forget_password(
    forget_password_data: ForgetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    await forget_password_crud(forget_password_data, background_tasks, db)

    return {"message": "Password reset email has been sent."}


@auth_router.post("/reset-password", response_model=SuccessMessage)
async def reset_password(
    reset_password_data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
):
    await reset_password_crud(reset_password_data, db)

    return {
        "success": True,
        "status_code": status.HTTP_200_OK,
        "message": "Password Rest Successfull!",
    }


@auth_router.post("/logout", response_model=SuccessMessage)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    session_token: str | None = Cookie(default=None),
):
    await logout_crud(session_token, db)

    # Clear cookie
    response.delete_cookie("session_token")

    return {
        "success": True,
        "status_code": status.HTTP_200_OK,
        "message": "Logged out successfully",
    }
