import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def _send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None
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
        settings.MAIL_PORT
    ) as server:

        server.starttls()

        if settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
            server.login(
                settings.MAIL_USERNAME,
                settings.MAIL_PASSWORD
            )

        server.sendmail(
            settings.MAIL_FROM,
            [to_email],
            msg.as_string()
        )


def send_verification_email(
    to_email: str,
    code: str,
    first_name: str
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
        html_body
    )


def send_password_reset_email(
    to_email: str,
    reset_token: str,
    first_name: str
) -> None:

    subject = "Reset Your Password - KotChomnol"

    reset_link = (
        f"{settings.FRONTEND_URL}"
        f"/reset-password?token={reset_token}"
    )

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
        html_body
    )