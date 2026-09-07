"""Registration, login and refresh-token rotation."""

from __future__ import annotations

import logging
from datetime import UTC, datetime

import jwt
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import AuthenticationError, ConflictError, ValidationError_
from app.core.security import (
    create_access_token,
    create_email_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models import RefreshToken, User
from app.schemas.auth import AuthResponse, TokenPair
from app.services.email_service import EmailService

logger = logging.getLogger("resumeforge.auth")


def _normalise_email(email: str) -> str:
    return email.strip().lower()


def _issue_tokens(db: Session, user: User, *, user_agent: str | None = None) -> TokenPair:
    access = create_access_token(str(user.id), role=user.role, plan=user.plan)
    raw_refresh, expires_at = create_refresh_token(str(user.id))
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=expires_at,
            user_agent=(user_agent or "")[:255] or None,
        )
    )
    return TokenPair(
        access_token=access,
        refresh_token=raw_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


class AuthService:
    def __init__(self, db: Session, email_service: EmailService | None = None) -> None:
        self.db = db
        self.email = email_service or EmailService()

    # --- Registration ------------------------------------------------------

    def register(
        self, *, email: str, password: str, full_name: str, user_agent: str | None = None
    ) -> AuthResponse:
        from app.schemas.user import UserRead

        normalised = _normalise_email(email)
        existing = self.db.scalar(select(User).where(User.email == normalised))
        if existing is not None:
            raise ConflictError("An account with this email already exists.")

        user = User(
            email=normalised,
            password_hash=hash_password(password),
            full_name=full_name.strip(),
            plan="free",
            role="user",
        )
        self.db.add(user)
        try:
            self.db.flush()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("An account with this email already exists.") from exc

        tokens = _issue_tokens(self.db, user, user_agent=user_agent)
        self.db.commit()
        self.db.refresh(user)

        self.email.send_verification(
            to=user.email,
            name=user.full_name,
            token=create_email_token(str(user.id), "email_verify"),
        )
        return AuthResponse(**tokens.model_dump(), user=UserRead.model_validate(user))

    # --- Login -------------------------------------------------------------

    def login(self, *, email: str, password: str, user_agent: str | None = None) -> AuthResponse:
        from app.schemas.user import UserRead

        user = self.db.scalar(select(User).where(User.email == _normalise_email(email)))
        # Constant-ish work either way so a missing account is not obviously faster.
        if user is None or not verify_password(password, user.password_hash):
            raise AuthenticationError("Incorrect email or password.")
        if not user.is_active:
            raise AuthenticationError("This account has been deactivated.")

        user.last_login_at = datetime.now(UTC)
        tokens = _issue_tokens(self.db, user, user_agent=user_agent)
        self.db.commit()
        self.db.refresh(user)
        return AuthResponse(**tokens.model_dump(), user=UserRead.model_validate(user))

    # --- Refresh rotation --------------------------------------------------

    def refresh(self, raw_token: str, *, user_agent: str | None = None) -> TokenPair:
        token_hash = hash_token(raw_token)
        record = self.db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        if record is None:
            raise AuthenticationError("Your session is no longer valid. Please sign in again.")

        now = datetime.now(UTC)
        if record.revoked_at is not None:
            # A revoked token being reused suggests theft: drop the whole family.
            logger.warning("Reuse of a revoked refresh token", extra={"user_id": str(record.user_id)})
            self.revoke_all(record.user_id)
            self.db.commit()
            raise AuthenticationError("Your session is no longer valid. Please sign in again.")
        if record.expires_at <= now:
            raise AuthenticationError("Your session has expired. Please sign in again.")

        user = self.db.get(User, record.user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("This account is no longer active.")

        tokens = _issue_tokens(self.db, user, user_agent=user_agent)
        record.revoked_at = now
        record.replaced_by = hash_token(tokens.refresh_token)
        self.db.commit()
        return tokens

    def logout(self, raw_token: str | None) -> None:
        if not raw_token:
            return
        record = self.db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_token))
        )
        if record is not None and record.revoked_at is None:
            record.revoked_at = datetime.now(UTC)
            self.db.commit()

    def revoke_all(self, user_id) -> None:  # noqa: ANN001
        now = datetime.now(UTC)
        tokens = self.db.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
            )
        ).all()
        for token in tokens:
            token.revoked_at = now

    # --- Email verification & password reset -------------------------------

    def request_verification(self, user: User) -> None:
        if user.is_verified:
            return
        self.email.send_verification(
            to=user.email,
            name=user.full_name,
            token=create_email_token(str(user.id), "email_verify"),
        )

    def verify_email(self, token: str) -> User:
        user = self._user_from_email_token(token, "email_verify")
        if not user.is_verified:
            user.is_verified = True
            self.db.commit()
            self.email.send_welcome(to=user.email, name=user.full_name)
        return user

    def request_password_reset(self, email: str) -> None:
        user = self.db.scalar(select(User).where(User.email == _normalise_email(email)))
        # Always succeed so the endpoint cannot be used to enumerate accounts.
        if user is None or not user.is_active:
            logger.info("Password reset requested for unknown address")
            return
        self.email.send_password_reset(
            to=user.email,
            name=user.full_name,
            token=create_email_token(str(user.id), "password_reset", hours=1),
        )

    def reset_password(self, *, token: str, password: str) -> None:
        user = self._user_from_email_token(token, "password_reset")
        user.password_hash = hash_password(password)
        self.revoke_all(user.id)
        self.db.commit()

    def change_password(self, user: User, *, current: str, new: str) -> None:
        if not verify_password(current, user.password_hash):
            raise ValidationError_(
                "Your current password is incorrect.",
                details=[{"field": "currentPassword", "message": "Incorrect password."}],
            )
        user.password_hash = hash_password(new)
        self.revoke_all(user.id)
        self.db.commit()

    def _user_from_email_token(self, token: str, expected: str) -> User:
        import uuid as _uuid

        try:
            payload = decode_token(token, expected_type=expected)  # type: ignore[arg-type]
            user_id = _uuid.UUID(str(payload["sub"]))
        except (jwt.PyJWTError, KeyError, ValueError) as exc:
            raise ValidationError_("This link is invalid or has expired.") from exc

        user = self.db.get(User, user_id)
        if user is None or not user.is_active:
            raise ValidationError_("This link is invalid or has expired.")
        return user
