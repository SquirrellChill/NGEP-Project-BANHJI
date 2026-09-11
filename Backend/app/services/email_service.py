import hashlib
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings


def _send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:

    if not settings.MAIL_SERVER:
        print(f"\n--- [DEV EMAIL] To: {to_email} | Subject: {subject} ---")
        print(body)
        print("--- [END DEV EMAIL] ---\n")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to_email

    msg.attach(MIMEText(body, "plain"))

    if html_body:
        msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(
        settings.MAIL_SERVER,
        settings.MAIL_PORT,
    ) as server:

        server.starttls()

        if settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
            server.login(
                settings.MAIL_USERNAME,
                settings.MAIL_PASSWORD,
            )

        server.sendmail(
            settings.MAIL_FROM,
            [to_email],
            msg.as_string(),
        )


def send_verification_email(
    to_email: str,
    code: str,
    first_name: str,
) -> None:

    subject = "Your Verification Code - KotChomnol"

    body = (
        f"Hi {first_name},\n\n"
        f"Your verification code is: {code}\n"
        f"This code will expire in 15 minutes.\n\n"
        f"If you did not create an account, please ignore this email."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to KotChomnol, {first_name}!</h2>

        <p>
            Please use the verification code below
            to complete your registration:
        </p>

        <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #2563eb;
            margin: 20px 0;
        ">
            {code}
        </div>

        <p>This code expires in 15 minutes.</p>

        <hr style="
            border: none;
            border-top: 1px solid #eee;
            margin: 20px 0;
        " />

        <p style="font-size: 12px; color: #777;">
            If you did not request this code,
            no further action is required.
        </p>
    </div>
    """

    _send_email(
        to_email,
        subject,
        body,
        html_body,
    )


def send_password_reset_email(
    to_email: str,
    reset_token: str,
    first_name: str,
) -> None:

    subject = "Reset Your Password - KotChomnol"

    # Safely select the first URL from comma-separated FRONTEND_URL
    frontend_base = settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
    reset_link = f"{frontend_base}/reset-password?token={reset_token}"

    body = (
        f"Hi {first_name},\n\n"
        f"Click the link below to reset your password:\n"
        f"{reset_link}\n\n"
        f"This link expires in 30 minutes."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>

        <p>
            Hi {first_name}, click the button below
            to reset your password:
        </p>

        <a href="{reset_link}" style="
            display: inline-block;
            padding: 10px 20px;
            color: #fff;
            background-color: #2563eb;
            border-radius: 5px;
            text-decoration: none;
            margin: 15px 0;
        ">
            Reset Password
        </a>

        <p>This link expires in 30 minutes.</p>
    </div>
    """

    _send_email(
        to_email,
        subject,
        body,
        html_body,
    )


def send_password_change_otp_email(
    to_email: str,
    code: str,
    first_name: str | None = None,
) -> None:

    name = first_name or "KotChomnol User"
    subject = "Password Change Verification Code - KotChomnol"

    body = (
        f"Hi {name},\n\n"
        f"You requested to change your account password.\n"
        f"Your verification code is: {code}\n"
        f"This code will expire in 15 minutes.\n\n"
        f"If you did not request this change, please contact support or check your account security."
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937;">
        <h2 style="color: #7e22ce; margin-top: 0;">Password Change Verification</h2>
        <p>Hi <b>{name}</b>,</p>
        <p>You requested to change your KotChomnol account password. Enter the 6-digit verification code below to authorize this action:</p>

        <div style="text-align: center; margin: 24px 0;">
            <span style="
                font-size: 30px;
                font-weight: 700;
                letter-spacing: 6px;
                background-color: #f3e8ff;
                color: #7e22ce;
                padding: 12px 24px;
                border-radius: 8px;
                display: inline-block;
            ">{code}</span>
        </div>

        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">This code expires in 15 minutes. If you did not make this request, someone may be trying to access your account.</p>
    </div>
    """

    _send_email(
        to_email,
        subject,
        body,
        html_body,
    )


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