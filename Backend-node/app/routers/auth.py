from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories import user_repository as user_repo
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserOut,
)
from app.services.email_service import send_verification_email, send_password_reset_email
from app.core.security import hash_password, verify_password, create_access_token
from app.services.token_service import (
    generate_verification_code,
    hash_code,
    generate_reset_token,
    hash_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ------------------------------------------------------------------
# register
# ------------------------------------------------------------------
@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = user_repo.find_user_by_email(db, payload.email)

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # unverified account -> refresh their details + send a new code
        code, hashed_code, expires_at = generate_verification_code()

        existing_user.first_name = payload.first_name
        existing_user.last_name = payload.last_name
        existing_user.password_hash = hash_password(payload.password)
        existing_user.email_verification_code = hashed_code
        existing_user.email_verification_expires = expires_at
        user_repo.save_user(db, existing_user)

        send_verification_email(existing_user.email, code, existing_user.first_name)

        return {
            "success": True,
            "message": "Your account already exists but is not verified. A new verification code has been sent.",
        }

    # create new account
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

    send_verification_email(user.email, code, user.first_name)

    return {
        "success": True,
        "message": "Registration successful. Please check your email for the verification code.",
    }


# ------------------------------------------------------------------
# login
# ------------------------------------------------------------------
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = user_repo.find_user_by_email(db, payload.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(
            status_code=403, detail="Please verify your email before logging in."
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"id": user.user_id})

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": UserOut.model_validate(user),
        },
    }


# ------------------------------------------------------------------
# logout (stateless JWT — nothing to invalidate server-side)
# ------------------------------------------------------------------
@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}


# ------------------------------------------------------------------
# get current user
# ------------------------------------------------------------------
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": {"user": UserOut.model_validate(current_user)}}


# ------------------------------------------------------------------
# forgot password
# ------------------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = user_repo.find_user_by_email(db, payload.email)

    # always return the same response, whether or not the email exists (security)
    generic_response = {"success": True, "message": "If email exists, reset link sent"}

    if not user:
        return generic_response

    token, hashed_token, expires_at = generate_reset_token()
    user.password_reset_token = hashed_token
    user.password_reset_expires = expires_at
    user_repo.save_user(db, user)

    send_password_reset_email(user.email, token, user.first_name)

    return generic_response


# ------------------------------------------------------------------
# reset password
# ------------------------------------------------------------------
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    hashed_token = hash_token(payload.token)
    user = user_repo.find_user_by_reset_token_hash(db, hashed_token)

    if not user or not user.password_reset_expires:
        raise HTTPException(status_code=400, detail="Token invalid or expired")

    expires_at = user.password_reset_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token invalid or expired")

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


# ------------------------------------------------------------------
# verify email
# ------------------------------------------------------------------
@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = user_repo.find_user_by_email(db, payload.email)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    if user.is_verified:
        return {"success": True, "message": "Email already verified."}

    now = datetime.now(timezone.utc)

    locked_until = user.email_verification_locked_until
    if locked_until:
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until > now:
            raise HTTPException(
                status_code=429,
                detail="Too many incorrect attempts. Please try again later.",
            )

    expires_at = user.email_verification_expires
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(
                status_code=400, detail="Verification code expired."
            )

    if hash_code(payload.code) != user.email_verification_code:
        user.email_verification_attempts += 1

        if user.email_verification_attempts >= 5:
            user.email_verification_locked_until = now + timedelta(minutes=5)
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


# ------------------------------------------------------------------
# resend verification email
# ------------------------------------------------------------------
@router.post("/resend-verification")
def resend_verification_email(
    payload: ResendVerificationRequest, db: Session = Depends(get_db)
):
    user = user_repo.find_user_by_email(db, payload.email)

    generic_response = {
        "success": True,
        "message": "If the account exists and is not verified, a verification code has been sent.",
    }

    if not user or user.is_verified:
        return generic_response

    # cooldown: don't resend if the last code still has more than 9 minutes left
    if user.email_verification_expires:
        expires_at = user.email_verification_expires
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        remaining = (expires_at - datetime.now(timezone.utc)).total_seconds()
        if remaining > 9 * 60:
            raise HTTPException(
                status_code=429,
                detail="Please wait before requesting another verification code.",
            )

    code, hashed_code, expires_at = generate_verification_code()
    user.email_verification_code = hashed_code
    user.email_verification_expires = expires_at
    user_repo.save_user(db, user)

    send_verification_email(user.email, code, user.first_name)

    return generic_response
