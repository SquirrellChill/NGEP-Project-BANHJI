from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, auth_telegram, telegram_test_page

app = FastAPI(title="BANHJI API")

# Allow your frontend (e.g. Vite dev server) to call this API during development.
# Tighten this to your real frontend domain before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(auth_telegram.router)
app.include_router(telegram_test_page.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "BANHJI API"}