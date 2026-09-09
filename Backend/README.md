# BANHJI Backend

FastAPI backend for authentication, Telegram login, sales transactions,
dashboard summaries, and voice-based sale capture.

## Requirements

- Python 3.11 or newer
- MySQL 8.0 or newer
- A Gemini API key for the voice endpoints
- A Telegram Login Client ID when Telegram login is enabled

## Installation

From the repository root:

```powershell
cd Backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r .\requirements.txt
```

On Windows, if script activation is blocked for the current session, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

## Configuration

Create the local environment file:

```powershell
Copy-Item Backend\.env.example Backend\.env
```

Edit `Backend/.env` and set at least:

```dotenv
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/kotchomnol

GEMINI_API_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
TELEGRAM_CLIENT_ID=

SECRET_KEY=change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_SERVER=
MAIL_PORT=

FRONTEND_URL=http://localhost:5173,http://localhost:5174
```

Get `TELEGRAM_CLIENT_ID` from the bot's Login Widget settings in BotFather.
Never commit `Backend/.env` or paste tokens or client secrets into source
control.

## Database setup

Start MySQL, then create the current schema:

```powershell
mysql -u root -p < Backend\sql\schema.sql
```

The repository also contains an Alembic migration. To use it instead, run
from the `Backend` directory so the `app` package is importable:

```powershell
cd Backend
alembic upgrade head
cd ..
```

Use one schema-management approach for a fresh database; do not apply both to
the same empty database unless you know which objects overlap.

## Run the API

Run this command from the repository root. `--app-dir Backend` makes the
backend's `app` package importable while keeping the `Backend.tests` package
available for the Telegram test route:

```powershell
python -m uvicorn app.main:app --app-dir Backend --reload --host 127.0.0.1 --port 8000
```

Useful URLs:

- API health: <http://127.0.0.1:8000/>
- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>
- Telegram test page: <http://127.0.0.1:8000/telegram-test>

## Telegram login test

Telegram validates the page URL before it calls the backend. For local
testing, expose port 8000 through an HTTPS tunnel such as ngrok, add the exact
tunnel URL to the bot's Login Widget Allowed URLs in BotFather, and open:

```text
https://<your-tunnel-host>/telegram-test
```

Opening the page with an unregistered `localhost`, `127.0.0.1`, or tunnel
hostname produces Telegram's “Bot invalid domain” message.

The test page posts the widget result to `POST /auth/telegram/login`.

For the production frontend, add all of these URLs to the bot's Login Widget
Allowed URLs in BotFather:

```text
https://kotchomnol.vercel.app
https://kotchomnol.vercel.app/login
https://kotchomnol.vercel.app/register
```

Telegram's JavaScript SDK sets `redirect_uri` to the current origin and path,
so both pages containing the Telegram button must be registered. The Render
API endpoint is not an OAuth redirect URI.

## Main API groups

- `/auth/*` — register, verify email, login, logout, password reset
- `/auth/telegram/login` — Telegram Login Widget authentication
- `/dashboard/*` — dashboard summaries and recent transactions
- `/transactions/*` — create, list, inspect, summarize, and delete sales
- `/voice/sale` — transcribe an uploaded recording into a draft sale
- `/voice/followup` — answer a clarification question
- `/voice/health` — inspect configured voice models (authenticated)

All transaction and voice routes require a bearer token from login. Voice
processing returns a draft; save it through `/transactions` only after the
seller confirms it.

## Telegram verification tests

With the API running and `Backend/.env` configured:

```powershell
cd Backend
python tests\test_telegram_login.py
cd ..
```

This verifies valid, expired, and incorrectly addressed Telegram ID tokens
using an ephemeral test key; it does not use or print real credentials.

## Development notes

- CORS is restricted to the comma-separated origins in `FRONTEND_URL`.
  Update that setting when the frontend host changes.
- The default database and secret values are for local development only.
- Email settings are optional for local development; when SMTP credentials are
  absent, email delivery is handled according to the backend's configured
  fallback behavior.
