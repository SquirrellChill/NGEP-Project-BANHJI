from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import user_repository as user_repo
from app.schemas.user import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    UserOut,
    VerifyEmailRequest,
)
from app.services.email_service import send_password_reset_email, send_verification_email
from app.services.token_service import (
    generate_reset_token,
    generate_verification_code,
    hash_code,
    hash_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    existing_user = user_repo.find_user_by_email(db, payload.email)

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        code, hashed_code, expires_at = generate_verification_code()

        existing_user.first_name = payload.first_name
        existing_user.last_name = payload.last_name
        existing_user.phone_number = payload.phone_number
        existing_user.password_hash = hash_password(payload.password)
        existing_user.email_verification_code = hashed_code
        existing_user.email_verification_expires = expires_at
        existing_user.email_verification_attempts = 0
        existing_user.email_verification_locked_until = None
        user_repo.save_user(db, existing_user)

        background_tasks.add_task(
            send_verification_email, existing_user.email, code, existing_user.first_name
        )

        return {
            "success": True,
            "message": "Account already exists but is unverified. A new verification code has been sent to your email.",
        }

    code, hashed_code, expires_at = generate_verification_code()

    user = user_repo.create_user(
        db,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    user.email_verification_code = hashed_code
    user.email_verification_expires = expires_at
    user_repo.save_user(db, user)

    background_tasks.add_task(send_verification_email, user.email, code, user.first_name)

    return {
        "success": True,
        "message": "Registration successful. Please check your email for your verification code.",
    }


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = user_repo.find_user_by_email(db, payload.email)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or verification code.")

    if user.is_verified:
        return {"success": True, "message": "Email is already verified."}

    now = datetime.now(timezone.utc)

    if user.email_verification_locked_until:
        locked_until = user.email_verification_locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until > now:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed attempts. Please try again later.",
            )

    if user.email_verification_expires:
        expires_at = user.email_verification_expires
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(
                status_code=400, detail="Verification code has expired. Please request a new code."
            )

    if hash_code(payload.code) != user.email_verification_code:
        user.email_verification_attempts += 1
        if user.email_verification_attempts >= 5:
            user.email_verification_locked_until = now + timedelta(minutes=15)
            user.email_verification_attempts = 0

        user_repo.save_user(db, user)
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    user.is_verified = True
    user.email_verification_code = None
    user.email_verification_expires = None
    user.email_verification_attempts = 0
    user.email_verification_locked_until = None
    user_repo.save_user(db, user)

    return {"success": True, "message": "Email verified successfully."}


@router.post("/resend-verification")
def resend_verification(
    payload: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = user_repo.find_user_by_email(db, payload.email)

    generic_response = {
        "success": True,
        "message": "If the account exists and is not verified, a verification code has been sent.",
    }

    if not user or user.is_verified:
        return generic_response

    now = datetime.now(timezone.utc)
    if user.email_verification_expires:
        expires_at = user.email_verification_expires
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        # Cooldown check: Allow resend only if less than 14 minutes remain out of 15
        remaining_seconds = (expires_at - now).total_seconds()
        if remaining_seconds > 14 * 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait before requesting another verification code.",
            )

    code, hashed_code, expires_at = generate_verification_code()
    user.email_verification_code = hashed_code
    user.email_verification_expires = expires_at
    user.email_verification_attempts = 0
    user_repo.save_user(db, user)

    background_tasks.add_task(send_verification_email, user.email, code, user.first_name)

    return generic_response


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = user_repo.find_user_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403, detail="Please verify your email before logging in."
        )

    token = create_access_token({"id": user.user_id})

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": UserOut.model_validate(user),
        },
    }


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": {"user": UserOut.model_validate(current_user)}}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = user_repo.find_user_by_email(db, payload.email)
    generic_response = {"success": True, "message": "If email exists, reset link sent."}

    if not user:
        return generic_response

    token, hashed_token, expires_at = generate_reset_token()
    user.password_reset_token = hashed_token
    user.password_reset_expires = expires_at
    user_repo.save_user(db, user)

    background_tasks.add_task(
        send_password_reset_email, user.email, token, user.first_name
    )

    return generic_response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    hashed_token = hash_token(payload.token)
    user = user_repo.find_user_by_reset_token_hash(db, hashed_token)

    if not user or not user.password_reset_expires:
        raise HTTPException(status_code=400, detail="Token invalid or expired.")

    expires_at = user.password_reset_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token invalid or expired.")

    user.password_hash = hash_password(payload.password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user_repo.save_user(db, user)

    new_token = create_access_token({"id": user.user_id})

    return {
        "success": True,
        "message": "Password reset successful",
        "data": {"token": new_token},
    }