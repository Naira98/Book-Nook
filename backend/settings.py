import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Book Nook API"
    VERSION: str = "1.0.0"
    APP_HOST: str = "http://localhost"

    # Database settings
    DATABASE_URL: str | None = os.getenv("SQLALCHEMY_DATABASE_URL")

    # Session settings
    SESSION_EXPIRE_MINUTES: int = 60 * 24 * 30 * 6  # 6 months

    # Forget password settings
    FORGET_PASSWORD_SECRET_KEY: str | None = os.getenv("FORGET_PASSWORD_SECRET_KEY")
    RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: int = 10
    RESET_PASSWORD_URL: str = "/reset-password"
    ALGORITHM: str = "HS256"
    # Email verification settings
    JWT_SECRET_KEY: str | None = os.getenv("JWT_SECRET_KEY")
    EMAIL_VERIFICATION_SECRET_KEY: str | None = os.getenv("EMAIL_VERIFICATION_SECRET_KEY")
    EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES: int = 60 * 24 * 30 


    # Email Configuration
    MAIL_USERNAME: str | None = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: str | None = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: str | None = os.getenv("MAIL_FROM")
    MAIL_PORT: int | None = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str | None = os.getenv("MAIL_SERVER")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    USE_CREDENTIALS: bool = os.getenv("USE_CREDENTIALS", "True").lower() == "true"

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str | None = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str | None = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str | None = os.getenv("CLOUDINARY_API_SECRET")


settings = Settings()
