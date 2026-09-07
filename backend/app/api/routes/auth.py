"""Authentication endpoints: register, login, refresh rotation, verify, reset."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status

from app.api.deps import CurrentUser, DbSession
from app.core.config import settings
from app.core.errors import AuthenticationError
from app.core.rate_limit import (
    LOGIN_LIMIT,
    PASSWORD_RESET_LIMIT,
    REGISTER_LIMIT,
    rate_limit,
)
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    VerifyEmailRequest,
)
from app.schemas.common import MessageResponse
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "rf_refresh"


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Same-site cookie for production (frontend and API share an origin via NGINX).

    The token is also returned in the body so cross-origin local development
    works without relaxing cookie security.
    """
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(REGISTER_LIMIT)],
)
def register(payload: RegisterRequest, request: Request, response: Response, db: DbSession):
    result = AuthService(db).register(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        user_agent=request.headers.get("user-agent"),
    )
    _set_refresh_cookie(response, result.refresh_token)
    return result


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(LOGIN_LIMIT)])
def login(payload: LoginRequest, request: Request, response: Response, db: DbSession):
    result = AuthService(db).login(
        email=payload.email,
        password=payload.password,
        user_agent=request.headers.get("user-agent"),
    )
    _set_refresh_cookie(response, result.refresh_token)
    return result


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, request: Request, response: Response, db: DbSession):
    token = payload.refresh_token or request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise AuthenticationError("No refresh token was provided.")
    tokens = AuthService(db).refresh(token, user_agent=request.headers.get("user-agent"))
    _set_refresh_cookie(response, tokens.refresh_token)
    return tokens


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshRequest, request: Request, response: Response, db: DbSession):
    token = payload.refresh_token or request.cookies.get(REFRESH_COOKIE)
    AuthService(db).logout(token)
    response.delete_cookie(REFRESH_COOKIE, path="/")
    return MessageResponse(message="Signed out.")


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser):
    return user


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    dependencies=[Depends(PASSWORD_RESET_LIMIT)],
)
def forgot_password(payload: ForgotPasswordRequest, db: DbSession):
    AuthService(db).request_password_reset(payload.email)
    # Deliberately identical whether or not the address exists.
    return MessageResponse(
        message="If an account exists for that address, a reset link is on its way."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    dependencies=[Depends(PASSWORD_RESET_LIMIT)],
)
def reset_password(payload: ResetPasswordRequest, db: DbSession):
    AuthService(db).reset_password(token=payload.token, password=payload.password)
    return MessageResponse(message="Your password has been updated. You can now sign in.")


@router.post("/verify-email", response_model=UserRead)
def verify_email(payload: VerifyEmailRequest, db: DbSession):
    return AuthService(db).verify_email(payload.token)


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    dependencies=[Depends(rate_limit(3, 900, scope="auth:resend"))],
)
def resend_verification(user: CurrentUser, db: DbSession):
    AuthService(db).request_verification(user)
    return MessageResponse(message="Verification email sent.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(payload: ChangePasswordRequest, user: CurrentUser, db: DbSession):
    AuthService(db).change_password(
        user, current=payload.current_password, new=payload.new_password
    )
    return MessageResponse(message="Password updated. Other sessions have been signed out.")
