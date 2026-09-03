"""
Verifies data from the Telegram Login Widget.

Telegram's widget sends: id, first_name, last_name, username, photo_url,
auth_date, and hash. The hash proves the data really came from Telegram
(signed with your bot token) and wasn't forged by someone calling your
API directly with made-up Telegram data.

Verification algorithm (per Telegram's docs):
  1. secret_key = SHA256(bot_token)
  2. data_check_string = all fields except 'hash', sorted alphabetically,
     joined as "key=value" with newlines
  3. expected_hash = HMAC-SHA256(data_check_string, secret_key), hex-encoded
  4. Valid if expected_hash == hash, AND auth_date isn't too old (replay protection)
"""

import hashlib
import hmac
import time

from app.core.config import settings


class TelegramAuthError(Exception):
    pass


def verify_telegram_login(data: dict, max_age_seconds: int = 86400) -> None:
    """Raises TelegramAuthError if the data is invalid, forged, or expired."""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise TelegramAuthError("Telegram login is not configured on this server.")

    data = dict(data)  # don't mutate caller's dict
    received_hash = data.pop("hash", None)
    if not received_hash:
        raise TelegramAuthError("Missing hash in Telegram login data.")

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(data.items()) if value is not None
    )

    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
    expected_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise TelegramAuthError("Invalid Telegram login signature.")

    auth_date = int(data.get("auth_date", 0))
    if time.time() - auth_date > max_age_seconds:
        raise TelegramAuthError("Telegram login data has expired.")
