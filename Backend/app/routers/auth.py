from datetime import datetime, timedelta, timezone
import os
import shutil

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import user_repository as user_repo
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    RequestPasswordChangeOTPRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    UserOut,
    VerifyChangePasswordRequest,
    VerifyEmailRequest,
)
from app.services.email_service import (
    send_password_change_otp_email,
    send_password_reset_email,
    send_verification_email,
)
from app.services.token_service import (
    generate_reset_token,
    generate_verification_code,
    hash_code,
    hash_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AuthenticatedResetVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


class AuthenticatedForgotOTPRequest(BaseModel):
    email: EmailStr


@router.post("/register")
def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # 1. Prevent duplicate phone collision across accounts
    if payload.phone_number:
        phone_user = user_repo.find_user_by_phone_number(db, payload.phone_number)
        if phone_user and phone_user.email != payload.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This phone number is already registered with another account.",
            )

    existing_user = user_repo.find_user_by_email(db, payload.email)

    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        existing_user.first_name = payload.first_name
        existing_user.last_name = payload.last_name
        existing_user.phone_number = payload.phone_number
        existing_user.password_hash = hash_password(payload.password)
        existing_user.email_verification_attempts = 0
        existing_user.email_verification_locked_until = None

        if settings.REQUIRE_EMAIL_VERIFICATION:
            code, hashed_code, expires_at = generate_verification_code()
            existing_user.email_verification_code = hashed_code
            existing_user.email_verification_expires = expires_at

            try:
                user_repo.save_user(db, existing_user)
            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This phone number is already registered with another account.",
                )

            background_tasks.add_task(
                send_verification_email, existing_user.email, code, existing_user.first_name
            )

            return {
                "success": True,
                "message": "Account already exists but is unverified. A new verification code has been sent to your email.",
                "data": {"requires_email_verification": True},
            }

        try:
            user_repo.save_user(db, existing_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This phone number is already registered with another account.",
            )

        return {
            "success": True,
            "message": "Account updated. You can sign in now.",
            "data": {"requires_email_verification": False},
        }

    try:
        user = user_repo.create_user(
            db,
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone_number=payload.phone_number,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number or email already exists.",
        )

    if settings.REQUIRE_EMAIL_VERIFICATION:
        code, hashed_code, expires_at = generate_verification_code()
        user.email_verification_code = hashed_code
        user.email_verification_expires = expires_at
        user_repo.save_user(db, user)

        background_tasks.add_task(send_verification_email, user.email, code, user.first_name)

        return {
            "success": True,
            "message": "Registration successful. Please check your email for your verification code.",
            "data": {"requires_email_verification": True},
        }

    return {
        "success": True,
        "message": "Registration successful. You can sign in now.",
        "data": {"requires_email_verification": False},
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

    if not settings.REQUIRE_EMAIL_VERIFICATION:
        return generic_response

    if not user or user.is_verified:
        return generic_response

    now = datetime.now(timezone.utc)
    if user.email_verification_expires:
        expires_at = user.email_verification_expires
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

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

    if settings.REQUIRE_EMAIL_VERIFICATION and not user.is_verified:
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


@router.put("/me")
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email and payload.email != current_user.email:
        existing = user_repo.find_user_by_email(db, payload.email)
        if existing and existing.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
    if payload.phone_number != current_user.phone_number:
        existing = user_repo.find_user_by_phone_number(db, payload.phone_number)
        if existing and existing.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this phone number already exists.",
            )

    current_user.first_name = payload.first_name
    current_user.last_name = payload.last_name
    current_user.phone_number = payload.phone_number
    current_user.email = payload.email

    try:
        saved_user = user_repo.save_user(db, current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with these details already exists.",
        )

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {"user": UserOut.model_validate(saved_user)},
    }


@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (.jpg, .jpeg, .png, .webp) are allowed.",
        )

    file_name = f"user_{current_user.user_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/uploads/avatars/{file_name}"
    current_user.profile_picture = avatar_url
    user_repo.save_user(db, current_user)

    return {
        "success": True,
        "message": "Avatar updated successfully",
        "data": {"user": UserOut.model_validate(current_user)},
    }


@router.post("/change-password/request-otp")
def request_change_password_otp(
    payload: RequestPasswordChangeOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account does not have a password set.",
        )

    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    code, hashed_code, expires_at = generate_verification_code()
    current_user.email_verification_code = hashed_code
    current_user.email_verification_expires = expires_at
    current_user.email_verification_attempts = 0
    user_repo.save_user(db, current_user)

    background_tasks.add_task(
        send_password_change_otp_email,
        current_user.email,
        code,
        current_user.first_name,
    )

    return {
        "success": True,
        "message": "Verification code has been sent to your registered email.",
    }


@router.post("/change-password/verify")
def verify_and_change_password(
    payload: VerifyChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account does not have a password set.",
        )

    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    now = datetime.now(timezone.utc)
    if not current_user.email_verification_expires or not current_user.email_verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found. Please request a new one.",
        )

    expires_at = current_user.email_verification_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one.",
        )

    if hash_code(payload.code.strip()) != current_user.email_verification_code:
        current_user.email_verification_attempts += 1
        user_repo.save_user(db, current_user)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    current_user.password_hash = hash_password(payload.new_password)
    current_user.email_verification_code = None
    current_user.email_verification_expires = None
    current_user.email_verification_attempts = 0
    user_repo.save_user(db, current_user)

    return {"success": True, "message": "Password changed successfully."}


@router.post("/change-password/forgot-current-otp")
def request_forgot_current_password_otp(
    payload: AuthenticatedForgotOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email.strip().lower() != current_user.email.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The email entered does not match your registered account email.",
        )

    code, hashed_code, expires_at = generate_verification_code()
    current_user.email_verification_code = hashed_code
    current_user.email_verification_expires = expires_at
    current_user.email_verification_attempts = 0
    user_repo.save_user(db, current_user)

    background_tasks.add_task(
        send_password_change_otp_email,
        current_user.email,
        code,
        current_user.first_name,
    )

    return {
        "success": True,
        "message": f"Verification code sent to {current_user.email}",
    }


@router.post("/change-password/reset-with-otp")
def reset_with_otp_authenticated(
    payload: AuthenticatedResetVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    if not current_user.email_verification_expires or not current_user.email_verification_code:
        raise HTTPException(status_code=400, detail="No active verification code found.")

    expires_at = current_user.email_verification_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < now:
        raise HTTPException(status_code=400, detail="Verification code has expired.")

    if hash_code(payload.code.strip()) != current_user.email_verification_code:
        current_user.email_verification_attempts += 1
        user_repo.save_user(db, current_user)
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    current_user.password_hash = hash_password(payload.new_password)
    current_user.email_verification_code = None
    current_user.email_verification_expires = None
    current_user.email_verification_attempts = 0
    user_repo.save_user(db, current_user)

    return {"success": True, "message": "Password reset successfully!"}


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