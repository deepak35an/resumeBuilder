from __future__ import annotations

import re

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import CamelModel
from app.schemas.user import UserRead

PASSWORD_RULES = "At least 8 characters, including one letter and one number."


def _validate_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError(PASSWORD_RULES)
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError(PASSWORD_RULES)
    return value


class RegisterRequest(CamelModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field("", max_length=160)

    _check_password = field_validator("password")(_validate_password)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class RefreshRequest(CamelModel):
    refresh_token: str | None = None


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)

    _check_password = field_validator("password")(_validate_password)


class VerifyEmailRequest(CamelModel):
    token: str


class ChangePasswordRequest(CamelModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    _check_password = field_validator("new_password")(_validate_password)


class TokenPair(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(TokenPair):
    user: UserRead
