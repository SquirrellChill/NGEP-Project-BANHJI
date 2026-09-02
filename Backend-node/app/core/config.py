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
    MAIL_SERVER: str = ""
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "no-reply@kotchomnol.app"

    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587

    # Used to build the password reset link sent by email
    FRONTEND_URL: str = "http://localhost:5173"

    #Telegram Login Widget (leave blank to disable Telegram Login)
    TELEGRAM_BOT_TOKEN: str=""
    TELEGRAM_BOT_USERNAME: str=""

    #SMS provider (False= print OTP codes to console instead of sending)
    SMS_PROVIDER_ENABLED: bool= False

    class Config:
        env_file = ".env"


settings = Settings()
