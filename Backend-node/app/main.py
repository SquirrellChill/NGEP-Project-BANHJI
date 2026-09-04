from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.core.database import Base, engine
from app.routers import auth, auth_telegram, telegram_test_page

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KotChomnol API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fix: Remove prefix="/auth" so the endpoint matches POST /auth/register
app.include_router(auth.router)
app.include_router(auth_telegram.router)
app.include_router(telegram_test_page.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "BANHJI API"}