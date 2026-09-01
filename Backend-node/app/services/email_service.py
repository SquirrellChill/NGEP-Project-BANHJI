"""
Sends verification codes and password reset links by email.

Uses plain smtplib so it works with any SMTP provider (Gmail app password,
SendGrid, Mailgun, etc). Set SMTP_* values in your .env — until then, emails
are just printed to the console so you can keep developing without real SMTP
credentials.
"""

import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not settings.SMTP_HOST:
        # No SMTP configured yet — print instead of sending, so local dev isn't blocked.
        print(f"\n--- [DEV EMAIL] To: {to_email} | Subject: {subject} ---")
        print(body)
        print("--- [END DEV EMAIL] ---\n")
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())


def send_verification_email(to_email: str, code: str, first_name: str) -> None:
    subject = "Verify your BANHJI account"
    body = (
        f"Hi {first_name},\n\n"
        f"Your BANHJI verification code is: {code}\n"
        f"This code expires in 15 minutes.\n\n"
        f"If you didn't request this, you can ignore this email."
    )
    _send_email(to_email, subject, body)


def send_password_reset_email(to_email: str, reset_token: str, first_name: str) -> None:
    subject = "Reset your BANHJI password"
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    body = (
        f"Hi {first_name},\n\n"
        f"Click the link below to reset your BANHJI password:\n{reset_link}\n"
        f"This link expires in 30 minutes.\n\n"
        f"If you didn't request this, you can ignore this email."
    )
    _send_email(to_email, subject, body)
