from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone_number: str = Field(min_length=1, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)


class UpdateProfileRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone_number: str = Field(min_length=1, max_length=20)
    email: EmailStr | None = None
    profile_picture: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class RequestPasswordChangeOTPRequest(BaseModel):
    current_password: str


class VerifyChangePasswordRequest(BaseModel):
    current_password: str
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8)


class UserOut(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: EmailStr | None
    phone_number: str | None
    profile_picture: str | None = None
    is_verified: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    success: bool = True
    message: str
    data: dict


class TelegramAuthRequest(BaseModel):
    id_token: str = Field(min_length=1)