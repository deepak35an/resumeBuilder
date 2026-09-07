"""Shared FastAPI dependencies: authentication, roles, plan gating and quotas."""

from __future__ import annotations

import uuid
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import AuthenticationError, PermissionError_, PlanLimitError
from app.core.plans import UNLIMITED, limits_for
from app.core.security import decode_token
from app.models import UsageEvent, User

bearer_scheme = HTTPBearer(auto_error=False, description="JWT access token")

DbSession = Annotated[Session, Depends(get_db)]


def _user_from_token(token: str, db: Session) -> User:
    try:
        payload = decode_token(token, expected_type="access")
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Your session has expired.", code="token_expired") from exc
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid authentication credentials.") from exc

    try:
        user_id = uuid.UUID(str(payload.get("sub")))
    except (TypeError, ValueError) as exc:
        raise AuthenticationError("Invalid authentication credentials.") from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise AuthenticationError("This account is no longer active.")
    return user


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User:
    if credentials is None or not credentials.credentials:
        raise AuthenticationError("Sign in to continue.")
    return _user_from_token(credentials.credentials, db)


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User | None:
    """For endpoints that work anonymously but personalise when signed in."""
    if credentials is None or not credentials.credentials:
        return None
    try:
        return _user_from_token(credentials.credentials, db)
    except AuthenticationError:
        return None


def get_current_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if not user.is_admin:
        raise PermissionError_("Administrator access is required.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]
AdminUser = Annotated[User, Depends(get_current_admin)]


# --- Plan gating ------------------------------------------------------------

FEATURE_MESSAGES = {
    "docx_export": "DOCX export is a Pro feature.",
    "version_history": "Version history is a Pro feature.",
    "advanced_ats": "Advanced ATS analysis is a Pro feature.",
    "premium_templates": "This template is available on the Pro plan.",
    "tailored_versions": "Tailored resume versions are a Pro feature.",
    "ai_features": "AI assistance is not available on your plan.",
    "job_matcher": "Job matching is not available on your plan.",
}


def require_feature(feature: str) -> Callable[[User], User]:
    """Dependency factory that blocks a request when the plan lacks a feature."""

    def _dependency(user: CurrentUser) -> User:
        if not getattr(limits_for(user.plan), feature, False):
            raise PlanLimitError(
                FEATURE_MESSAGES.get(feature, "This feature is available on the Pro plan."),
                details={"feature": feature, "requiredPlan": "pro"},
            )
        return user

    return _dependency


def usage_count(db: Session, user_id: uuid.UUID, action: str, *, hours: int = 24) -> int:
    since = datetime.now(UTC) - timedelta(hours=hours)
    stmt = select(func.count(UsageEvent.id)).where(
        UsageEvent.user_id == user_id,
        UsageEvent.action == action,
        UsageEvent.created_at >= since,
    )
    return int(db.execute(stmt).scalar_one())


def record_usage(db: Session, user: User | None, action: str, **meta: object) -> None:
    db.add(
        UsageEvent(
            user_id=user.id if user else None,
            action=action,
            plan=user.plan if user else "anonymous",
            meta=dict(meta),
        )
    )


def enforce_quota(db: Session, user: User, action: str, quota_key: str) -> None:
    """Raise `PlanLimitError` when the signed-in user is out of daily allowance."""
    allowance = getattr(limits_for(user.plan), quota_key, UNLIMITED)
    if allowance == UNLIMITED:
        return
    used = usage_count(db, user.id, action)
    if used >= allowance:
        raise PlanLimitError(
            f"You have used your daily allowance of {allowance} for this action. "
            "Upgrade to Pro for a higher limit.",
            code="quota_exceeded",
            details={"action": action, "limit": allowance, "used": used, "requiredPlan": "pro"},
        )


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
