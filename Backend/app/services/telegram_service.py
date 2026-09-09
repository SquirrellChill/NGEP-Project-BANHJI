"""Verify ID tokens returned by Telegram's current Login SDK."""

from functools import lru_cache

import httpx
from jose import JWTError, jwt

from app.core.config import settings


TELEGRAM_ISSUER = "https://oauth.telegram.org"
TELEGRAM_JWKS_URL = f"{TELEGRAM_ISSUER}/.well-known/jwks.json"
TELEGRAM_SIGNING_ALGORITHM = "RS256"


class TelegramAuthError(Exception):
    pass


@lru_cache(maxsize=1)
def _fetch_jwks() -> dict:
    try:
        response = httpx.get(TELEGRAM_JWKS_URL, timeout=5.0)
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise TelegramAuthError("Could not load Telegram signing keys.") from exc


def _find_signing_key(id_token: str, jwks: dict) -> dict:
    try:
        header = jwt.get_unverified_header(id_token)
    except JWTError as exc:
        raise TelegramAuthError("Invalid Telegram ID token.") from exc

    if header.get("alg") != TELEGRAM_SIGNING_ALGORITHM:
        raise TelegramAuthError("Unsupported Telegram ID token algorithm.")

    key = next(
        (
            candidate
            for candidate in jwks.get("keys", [])
            if candidate.get("kid") == header.get("kid")
        ),
        None,
    )
    if not key:
        raise TelegramAuthError("Telegram signing key was not found.")
    return key


def verify_telegram_login(id_token: str, jwks: dict | None = None) -> dict:
    """Return verified Telegram claims or raise ``TelegramAuthError``."""
    if not settings.TELEGRAM_CLIENT_ID:
        raise TelegramAuthError("Telegram login is not configured on this server.")

    try:
        signing_keys = jwks or _fetch_jwks()
        signing_key = _find_signing_key(id_token, signing_keys)
        claims = jwt.decode(
            id_token,
            signing_key,
            algorithms=[TELEGRAM_SIGNING_ALGORITHM],
            audience=settings.TELEGRAM_CLIENT_ID,
            issuer=TELEGRAM_ISSUER,
        )
    except TelegramAuthError:
        raise
    except JWTError as exc:
        raise TelegramAuthError("Invalid or expired Telegram ID token.") from exc

    telegram_id = claims.get("id")
    subject = claims.get("sub")
    if isinstance(telegram_id, bool) or not isinstance(telegram_id, int):
        raise TelegramAuthError("Telegram ID token is missing the user ID.")
    if str(telegram_id) != str(subject):
        raise TelegramAuthError("Telegram ID token subject does not match the user ID.")

    return claims
