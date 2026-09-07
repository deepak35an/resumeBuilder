from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, UTCDateTime
from app.models.base import TimestampMixin, UUIDPrimaryKey

APPLICATION_STATUSES = (
    "saved",
    "applied",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
)


class Application(UUIDPrimaryKey, TimestampMixin, Base):
    """An Application Workspace: groups a resume, a job description and its reports.

    Deliberately a secondary feature - ResumeForge is not primarily a tracker.
    """

    __tablename__ = "applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="saved")
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )
    job_description_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True
    )
    ats_report_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("ats_reports.id", ondelete="SET NULL"), nullable=True
    )
    match_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
