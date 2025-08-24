from datetime import datetime, timedelta, timezone

from core.auth import (
    create_token_generic,
    decode_token_generic,
    get_password_hash,
    send_email,
    verify_password,
)
from db.database import get_db
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Response,
    status,
    Cookie,
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
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    ResetForegetPassword,
    SuccessMessage,
)
from settings import settings
from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from utils.auth import get_user_by_email, get_user_via_session

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

    # Generate verification token
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

    email_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Book Nook</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
                padding: 24px;
                -webkit-font-smoothing: antialiased;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }}
            .email-header {{
                background: #f8fafc;
                padding: 32px 30px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }}
            .logo {{
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #111827;
            }}
            .email-title {{
                font-size: 20px;
                font-weight: 500;
                margin-bottom: 8px;
                color: #111827;
            }}
            .email-subtitle {{
                font-size: 14px;
                color: #6b7280;
            }}
            .email-content {{
                padding: 40px 30px;
            }}
            .welcome-text {{
                font-size: 18px;
                color: #111827;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }}
            .message {{
                font-size: 15px;
                color: #6b7280;
                margin-bottom: 28px;
                text-align: center;
                line-height: 1.6;
            }}
            .verification-button {{
                display: block;
                width: 220px;
                margin: 32px auto;
                padding: 14px 28px;
                background: #111827;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                text-align: center;
                font-weight: 500;
                font-size: 15px;
                transition: background-color 0.2s ease;
            }}
            .verification-button:hover {{
                background: #374151;
            }}
            .link-backup {{
                background: #f9fafb;
                padding: 20px;
                border-radius: 6px;
                margin: 28px 0;
                text-align: center;
                border: 1px solid #e5e7eb;
            }}
            .backup-title {{
                margin-bottom: 12px;
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
            }}
            .verification-link {{
                color: #111827;
                font-size: 13px;
                word-break: break-all;
                font-family: 'SF Mono', Monaco, 'Courier New', monospace;
                line-height: 1.4;
            }}
            .features {{
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin: 32px 0;
            }}
            .feature {{
                text-align: center;
                padding: 20px 16px;
                background: #f9fafb;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
            }}
            .feature-icon {{
                font-size: 20px;
                margin-bottom: 12px;
                color: #4b5563;
            }}
            .feature-text {{
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
            }}
            .email-footer {{
                background: #f8fafc;
                padding: 28px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 12px;
                line-height: 1.5;
            }}
            .support-link {{
                color: #111827;
                text-decoration: none;
                font-weight: 500;
            }}
            .support-link:hover {{
                text-decoration: underline;
            }}
            @media (max-width: 600px) {{
                .features {{
                    grid-template-columns: 1fr;
                }}
                .email-content {{
                    padding: 32px 24px;
                }}
                .verification-button {{
                    width: 100%;
                    max-width: 220px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <div class="logo">📚 Book Nook</div>
                <h1 class="email-title">Verify Your Email</h1>
                <p class="email-subtitle">Welcome to our reading community</p>
            </div>
            
            <div class="email-content">
                <h2 class="welcome-text">Hello {new_user.first_name},</h2>
                
                <p class="message">
                    Thank you for joining Book Nook. We're excited to have you as part of our 
                    community of readers. To complete your registration, please verify your email address.
                </p>
                
                <a href="{verification_link}" class="verification-button">
                    Verify Email Address
                </a>
                
                <div class="link-backup">
                    <p class="backup-title">If the button doesn't work, copy and paste this link:</p>
                    <p class="verification-link">{verification_link}</p>
                </div>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">📖</div>
                        <p class="feature-text">Access thousands of books</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📚</div>
                        <p class="feature-text">Build your library</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🔍</div>
                        <p class="feature-text">Discover new titles</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">⭐</div>
                        <p class="feature-text">Personalized recommendations</p>
                    </div>
                </div>
            </div>
            
            <div class="email-footer">
                <p class="footer-text">
                    If you didn't create this account, please ignore this email.
                </p>
                <p class="footer-text">
                    Need assistance? <a href="mailto:book.nook.eglib@gmail.com" class="support-link">Contact Support</a>
                </p>
                <p class="footer-text">
                    © 2025 Book Nook. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Send verification email
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

    return {
        "success": True,
        "status_code": 201,
        "message": "User registered successfully! Verification email sent.",
    }


@auth_router.post("/verify-email", response_model=SuccessMessage)
async def verify_email(
    email_verification: EmailVerificationRequest, db: AsyncSession = Depends(get_db)
):
    print("IN VERIFY EMAIL🔥🔥🔥🔥🔥")
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
        user.email_verification_token = None

        await db.commit()

        return {
            "success": True,
            "status_code": 200,
            "message": "Email verified successfully.",
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


@auth_router.post("/login", response_model=LoginResponse)
async def login(
    user_login: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)
):
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

    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Book Nook</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
                padding: 24px;
                -webkit-font-smoothing: antialiased;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }}
            .email-header {{
                background: #f8fafc;
                padding: 32px 30px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }}
            .logo {{
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #111827;
            }}
            .email-title {{
                font-size: 20px;
                font-weight: 500;
                margin-bottom: 8px;
                color: #111827;
            }}
            .email-subtitle {{
                font-size: 14px;
                color: #6b7280;
            }}
            .email-content {{
                padding: 40px 30px;
            }}
            .alert-text {{
                font-size: 18px;
                color: #111827;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }}
            .message {{
                font-size: 15px;
                color: #6b7280;
                margin-bottom: 28px;
                text-align: center;
                line-height: 1.6;
            }}
            .reset-button {{
                display: block;
                width: 220px;
                margin: 32px auto;
                padding: 14px 28px;
                background: #111827;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                text-align: center;
                font-weight: 500;
                font-size: 15px;
                transition: background-color 0.2s ease;
            }}
            .reset-button:hover {{
                background: #374151;
            }}
            .link-backup {{
                background: #f9fafb;
                padding: 20px;
                border-radius: 6px;
                margin: 28px 0;
                text-align: center;
                border: 1px solid #e5e7eb;
            }}
            .backup-title {{
                margin-bottom: 12px;
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
            }}
            .reset-link {{
                color: #111827;
                font-size: 13px;
                word-break: break-all;
                font-family: 'SF Mono', Monaco, 'Courier New', monospace;
                line-height: 1.4;
            }}
            .security-section {{
                background: #f8fafc;
                padding: 20px;
                border-radius: 6px;
                margin: 28px 0;
                text-align: center;
                border: 1px solid #e5e7eb;
            }}
            .security-text {{
                color: #6b7280;
                font-size: 13px;
                font-weight: 500;
                line-height: 1.5;
            }}
            .warning-section {{
                background: #fef2f2;
                padding: 20px;
                border-radius: 6px;
                margin: 28px 0;
                text-align: center;
                border: 1px solid #fecaca;
            }}
            .warning-text {{
                color: #991b1b;
                font-size: 13px;
                font-weight: 500;
                line-height: 1.5;
            }}
            .email-footer {{
                background: #f8fafc;
                padding: 28px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 12px;
                line-height: 1.5;
            }}
            .support-link {{
                color: #111827;
                text-decoration: none;
                font-weight: 500;
            }}
            .support-link:hover {{
                text-decoration: underline;
            }}
            @media (max-width: 600px) {{
                .email-content {{
                    padding: 32px 24px;
                }}
                .reset-button {{
                    width: 100%;
                    max-width: 220px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <div class="logo">📚 Book Nook</div>
                <h1 class="email-title">Password Reset Request</h1>
                <p class="email-subtitle">Secure your account access</p>
            </div>
            
            <div class="email-content">
                <h2 class="alert-text">Reset Your Password</h2>
                
                <p class="message">
                    We received a request to reset your Book Nook account password. 
                    Click the button below to create a new secure password.
                </p>
                
                <a href="{reset_link}" class="reset-button">
                    Reset Password
                </a>
                
                <div class="link-backup">
                    <p class="backup-title">Or copy and paste this link into your browser:</p>
                    <p class="reset-link">{reset_link}</p>
                </div>
                
                <div class="security-section">
                    <p class="security-text">
                        ⏰ This link will expire in {settings.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES} minutes
                    </p>
                </div>
                
                <div class="warning-section">
                    <p class="warning-text">
                        ⚠️ If you didn't request this password reset, please ignore this email. 
                        Your account security is important to us.
                    </p>
                </div>
            </div>
            
            <div class="email-footer">
                <p class="footer-text">
                    This is an automated message. Please do not reply to this email.
                </p>
                <p class="footer-text">
                    Need help? <a href="mailto:book.nook.eglib@gmail.com" class="support-link">Contact our support team</a>
                </p>
                <p class="footer-text">
                    © 2025 Book Nook. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    await send_email(user.email, "Password Reset Request", html_body, background_tasks)

    return {"message": "Password reset email has been sent."}


@auth_router.post("/reset-password", response_model=SuccessMessage)
async def reset_password(rfp: ResetForegetPassword, db: AsyncSession = Depends(get_db)):
    if rfp.new_password != rfp.confirm_password:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "New password and confirm password are not same."},
        )

    try:
        info = decode_token_generic(
            rfp.reset_token,
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

    hashed_password = get_password_hash(rfp.new_password)

    user.password = hashed_password
    user.forget_password_token = None

    # remove all sessions after reseting password
    await db.execute(delete(Session).where(Session.user_id == user.id))

    await db.commit()
    return {
        "success": True,
        "status_code": status.HTTP_200_OK,
        "message": "Password Rest Successfull!",
    }


# Logout endpoint
@auth_router.post("/logout", response_model=SuccessMessage)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    session_token: str | None = Cookie(default=None),
):
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No active session found",
        )

    # Delete session from DB
    await db.execute(delete(Session).where(Session.session == session_token))
    await db.commit()

    # Clear cookie
    response.delete_cookie("session_token")

    return {
        "success": True,
        "status_code": status.HTTP_200_OK,
        "message": "Logged out successfully",
    }
