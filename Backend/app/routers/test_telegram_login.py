"""
Simulates a Telegram Login Widget request, using your real bot token to sign
the payload exactly the way Telegram would. Lets you test /auth/telegram/login
without needing a live domain for the actual widget yet.

Run from inside Backend-node/, with your server already running in another
terminal (uvicorn app.main:app --reload):

    python test_telegram_login.py
"""

import hashlib
import hmac
import time
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv
import os

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL = "http://127.0.0.1:8000/auth/telegram/login"


def sign_telegram_data(data: dict, bot_token: str) -> dict:
    """Signs data exactly the way Telegram's widget does."""
    data = dict(data)
    check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    data["hash"] = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return data


def post_json(url: str, payload: dict):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


def main():
    if not BOT_TOKEN:
        print("ERROR: TELEGRAM_BOT_TOKEN not found in .env")
        print("Add this line to Backend-node/.env and try again:")
        print("  TELEGRAM_BOT_TOKEN=your_real_token_here")
        return

    fake_login = {
        "id": 111222333,  # fake Telegram user ID, fine for testing
        "first_name": "Kimheng",
        "username": "kimheng_test",
        "auth_date": int(time.time()),
    }
    signed = sign_telegram_data(fake_login, BOT_TOKEN)

    print("=== Sending signed Telegram login request ===")
    print(json.dumps(signed, indent=2))
    print()

    status, body = post_json(API_URL, signed)
    print(f"=== Response (HTTP {status}) ===")
    print(json.dumps(body, indent=2))

    if status == 200:
        print("\nSUCCESS — Telegram login is working correctly.")
    else:
        print("\nFAILED — check the error above.")


if __name__ == "__main__":
    main()