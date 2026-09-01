"""
App configuration, loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # e.g. mysql+pymysql://user:password@host:3306/kotchomnol
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/kotchomnol"

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # SMTP (leave SMTP_HOST blank to print emails to console instead of sending)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@banhji.app"

    # Used to build the password reset link sent by email
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
