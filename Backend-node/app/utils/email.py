import hashlib
import secrets
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


def generate_otp() -> str:
    """Cryptographically secure 6-digit OTP."""
    return str(secrets.randbelow(900000) + 100000)


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp_hash(otp: str, hashed: str) -> bool:
    return hashlib.sha256(otp.encode()).hexdigest() == hashed


async def send_otp_email(email: str, otp: str):
    message = MessageSchema(
        subject="Your KotChomnol Verification Code",
        recipients=[email],
        body=f"Your verification code is: {otp}\nThis code expires in 10 minutes.",
        subtype=MessageType.plain,
    )
    fm = FastMail(conf)
    await fm.send_message(message)