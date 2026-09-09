from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import user_repository as user_repo
from app.schemas.user import TelegramAuthRequest
from app.schemas.user import UserOut
from app.services.telegram_service import verify_telegram_login, TelegramAuthError
from app.core.security import create_access_token

router = APIRouter(prefix="/auth/telegram", tags=["auth-telegram"])


@router.post("/login")
def telegram_login(payload: TelegramAuthRequest, db: Session = Depends(get_db)):
    try:
        claims = verify_telegram_login(payload.id_token)
    except TelegramAuthError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

    telegram_id = claims["id"]
    user = user_repo.find_user_by_telegram_id(db, telegram_id)

    if not user:
        user = user_repo.create_user_telegram(
            db,
            telegram_id=telegram_id,
            telegram_username=claims.get("preferred_username"),
            first_name=claims.get("given_name") or claims.get("name") or "Telegram User",
            last_name=claims.get("family_name") or "",
        )

    token = create_access_token({"id": user.user_id})

    return {
        "success": True,
        "message": "Login successful",
        "data": {"token": token, "user": UserOut.model_validate(user)},
    }
