import hashlib
import secrets
from datetime import datetime, timedelta, timezone


def generate_verification_code() -> tuple[str, str, datetime]:
    """
    Returns (plaintext_code, hashed_code, expires_at).
    Plaintext is emailed to the user; only the hash is stored in the DB,
    mirroring the Node version's sha256-hash-before-store approach.
    """
    code = f"{secrets.randbelow(1_000_000):06d}"  # 6-digit code, e.g. "042817"
    hashed = hashlib.sha256(code.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    return code, hashed, expires_at


def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def generate_reset_token() -> tuple[str, str, datetime]:
    """Returns (plaintext_token, hashed_token, expires_at)."""
    token = secrets.token_hex(32)
    hashed = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    return token, hashed, expires_at


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
