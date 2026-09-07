from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, JSONColumn
from app.models.base import CreatedAtMixin, UUIDPrimaryKey

# Metered actions. Plan quotas in core/plans.py are enforced against these.
USAGE_ATS_CHECK = "ats_check"
USAGE_JOB_MATCH = "job_match"
USAGE_AI = "ai_request"
USAGE_IMPORT = "resume_import"
USAGE_PDF = "pdf_export"
USAGE_DOCX = "docx_export"


class UsageEvent(UUIDPrimaryKey, CreatedAtMixin, Base):
    """Append-only usage ledger powering plan quotas and admin analytics."""

    __tablename__ = "usage_events"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(48), nullable=False, index=True)
    plan: Mapped[str] = mapped_column(String(32), nullable=False, default="free")
    meta: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)

    __table_args__ = (Index("ix_usage_events_user_action_created", "user_id", "action", "created_at"),)


class ErrorEvent(UUIDPrimaryKey, CreatedAtMixin, Base):
    """Application errors surfaced in the admin panel."""

    __tablename__ = "error_events"

    level: Mapped[str] = mapped_column(String(16), nullable=False, default="error")
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="api")
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    meta: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
