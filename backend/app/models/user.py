from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, JSONColumn, UTCDateTime
from app.models.base import CreatedAtMixin, TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.resume import Resume
    from app.models.subscription import Subscription


class User(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    avatar: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(32), default="free", nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="user", nullable=False)
    # Onboarding answers (target role, experience level) drive template recommendations.
    onboarding: Mapped[dict[str, Any]] = mapped_column(JSONColumn, default=dict, nullable=False)
    preferences: Mapped[dict[str, Any]] = mapped_column(JSONColumn, default=dict, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)

    resumes: Mapped[list[Resume]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    subscriptions: Mapped[list[Subscription]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


class RefreshToken(UUIDPrimaryKey, CreatedAtMixin, Base):
    """Hashed, rotating refresh tokens. The raw value never touches the database."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(UTCDateTime, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    replaced_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __table_args__ = (Index("ix_refresh_tokens_user_id_expires_at", "user_id", "expires_at"),)


class OAuthAccount(UUIDPrimaryKey, CreatedAtMixin, Base):
    """Reserved for future OAuth providers; email/password is the only live method."""

    __tablename__ = "oauth_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)

    __table_args__ = (
        Index("uq_oauth_provider_account", "provider", "provider_account_id", unique=True),
    )
