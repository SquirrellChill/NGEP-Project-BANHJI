import hashlib
import logging
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, formatdate, make_msgid

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

logger = logging.getLogger("email_service")


def _send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
    # Always log to terminal for local visibility and easy testing
    print("\n" + "=" * 60)
    print("📧 [OUTGOING EMAIL DISPATCH]")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Content:\n{body}")
    print("=" * 60 + "\n")

    if not settings.MAIL_SERVER:
        print("[EMAIL NOTICE] MAIL_SERVER is not set. Use code from above.")
        return

    from_name = getattr(settings, "MAIL_FROM_NAME", "KotChomnol")
    from_email = settings.MAIL_FROM or settings.MAIL_USERNAME

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr((from_name, from_email))
    msg["To"] = to_email
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="gmail.com")

    # Plain text fallback
    msg.attach(MIMEText(body, "plain", "utf-8"))

    # HTML body
    if html_body:
        msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        port = int(settings.MAIL_PORT or 587)
        with smtplib.SMTP(settings.MAIL_SERVER, port, timeout=12) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()

            if settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
                clean_pw = settings.MAIL_PASSWORD.replace(" ", "")
                server.login(settings.MAIL_USERNAME, clean_pw)

            server.sendmail(from_email, [to_email], msg.as_string())
            print(f"Email delivered successfully to {to_email}")
    except Exception as exc:
        print(f"[SMTP ERROR] Could not deliver email to {to_email}: {exc}")
        print("Use the fallback code printed in the terminal box above.\n")


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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e9d5ff; border-radius: 16px; background-color: #ffffff; color: #1e1b4b;">
        <div style="margin-bottom: 20px;">
            <span style="background-color: #7e22ce; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">KOTCHOMNOL</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0 0 12px 0;">Welcome, {first_name}!</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Please use the verification code below to verify your email address and activate your account:
        </p>
        <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; background-color: #f3e8ff; color: #7e22ce; padding: 14px 28px; border-radius: 12px; display: inline-block; border: 1px solid #d8b4fe;">{code}</span>
        </div>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0;">
            This verification code expires in 15 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #f3e8ff; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
            If you did not register for KotChomnol, you can safely ignore this email.
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

    frontend_base = settings.FRONTEND_URL.split(",")[0].strip().rstrip("/")
    reset_link = f"{frontend_base}/reset-password?token={reset_token}"

    body = (
        f"Hi {first_name},\n\n"
        f"Click the link below to reset your password:\n"
        f"{reset_link}\n\n"
        f"This link expires in 30 minutes."
    )

    html_body = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e9d5ff; border-radius: 16px; background-color: #ffffff; color: #1e1b4b;">
        <div style="margin-bottom: 20px;">
            <span style="background-color: #7e22ce; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">KOTCHOMNOL</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0 0 12px 0;">Password Reset Request</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Hi {first_name}, click the button below to set a new password for your account:
        </p>
        <div style="text-align: center; margin: 24px 0;">
            <a href="{reset_link}" style="display: inline-block; padding: 12px 28px; color: #ffffff; background-color: #7e22ce; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(126, 34, 206, 0.25);">
                Reset Password
            </a>
        </div>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0;">
            This link expires in 30 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #f3e8ff; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
            If you did not request this, please disregard this email.
        </p>
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e9d5ff; border-radius: 16px; background-color: #ffffff; color: #1e1b4b;">
        <div style="margin-bottom: 20px;">
            <span style="background-color: #7e22ce; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">KOTCHOMNOL</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0 0 12px 0;">Password Change Verification</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Hi <b>{name}</b>, enter the 6-digit verification code below to authorize changing your password:
        </p>
        <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; background-color: #f3e8ff; color: #7e22ce; padding: 14px 28px; border-radius: 12px; display: inline-block; border: 1px solid #d8b4fe;">{code}</span>
        </div>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0;">
            This code expires in 15 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #f3e8ff; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
            If you did not make this request, someone may be trying to access your account.
        </p>
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