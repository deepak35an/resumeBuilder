"""Password hashing, JWT issuing/verification and single-use token helpers."""

from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import bcrypt
import jwt

from app.core.config import settings

TokenType = Literal["access", "refresh", "email_verify", "password_reset"]

_BCRYPT_MAX_BYTES = 72


def _prepare(password: str) -> bytes:
    """bcrypt silently truncates past 72 bytes; pre-hash so long passwords keep entropy."""
    raw = password.encode("utf-8")
    if len(raw) > _BCRYPT_MAX_BYTES:
        return hashlib.sha256(raw).hexdigest().encode("utf-8")
    return raw


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(password), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _encode(subject: str, token_type: TokenType, expires_delta: timedelta, **claims: Any) -> str:
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
        "jti": secrets.token_urlsafe(16),
        **claims,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, *, role: str = "user", plan: str = "free") -> str:
    return _encode(
        user_id,
        "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        role=role,
        plan=plan,
    )


def create_refresh_token(user_id: str) -> tuple[str, datetime]:
    """Return the opaque refresh token plus its expiry (hash is what we persist)."""
    expires_at = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return secrets.token_urlsafe(48), expires_at


def create_email_token(user_id: str, token_type: TokenType, hours: int = 24) -> str:
    return _encode(user_id, token_type, timedelta(hours=hours))


def decode_token(token: str, *, expected_type: TokenType | None = None) -> dict[str, Any]:
    """Decode a JWT. Raises `jwt.PyJWTError` on any failure, including type mismatch."""
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    if expected_type and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("Unexpected token type")
    return payload


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
