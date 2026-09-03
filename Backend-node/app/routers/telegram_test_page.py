"""
A throwaway HTML page that embeds Telegram's real Login Widget, for manual
testing before your frontend has its own login page. Not meant for
production — just lets you click through the actual Telegram auth flow
locally (via an ngrok tunnel) and see the real response from your API.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from app.core.config import settings

router = APIRouter()


@router.get("/telegram-test", response_class=HTMLResponse)
def telegram_test_page():
    if not settings.TELEGRAM_BOT_USERNAME:
        return HTMLResponse(
            "<h2>TELEGRAM_BOT_USERNAME is not set in .env</h2>"
            "<p>Add <code>TELEGRAM_BOT_USERNAME=your_bot_username</code> "
            "(no @ symbol) to your .env file and restart the server.</p>",
            status_code=500,
        )

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><title>BANHJI - Telegram Login Test</title></head>
    <body style="font-family: sans-serif; max-width: 500px; margin: 60px auto; text-align: center;">
        <h2>Telegram Login Test</h2>
        <p>Click below to log in with your real Telegram account.</p>

        <script async src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="{settings.TELEGRAM_BOT_USERNAME}"
            data-size="large"
            data-onauth="onTelegramAuth(user)"
            data-request-access="write">
        </script>

        <pre id="result" style="text-align: left; background: #f4f4f4; padding: 16px; margin-top: 24px; white-space: pre-wrap;"></pre>

        <script>
        function onTelegramAuth(user) {{
            document.getElementById('result').textContent = 'Sending to API...\\n' + JSON.stringify(user, null, 2);

            fetch('/auth/telegram/login', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify(user)
            }})
            .then(res => res.json().then(data => ({{ status: res.status, data }})))
            .then(({{ status, data }}) => {{
                document.getElementById('result').textContent =
                    'HTTP ' + status + '\\n' + JSON.stringify(data, null, 2);
            }})
            .catch(err => {{
                document.getElementById('result').textContent = 'Error: ' + err;
            }});
        }}
        </script>
    </body>
    </html>
    """
    return HTMLResponse(html)