from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, JSONColumn
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.ats_report import ATSReport
    from app.models.resume_version import ResumeVersion
    from app.models.user import User


class Resume(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "resumes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    template_id: Mapped[str] = mapped_column(String(64), nullable=False, default="classic-ats")
    # Canonical ResumeData document (see schemas/resume.py) stored as JSONB.
    data: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
    settings: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
    ats_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    download_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Set when a resume was created via "Create tailored version".
    tailored_for: Mapped[str | None] = mapped_column(String(200), nullable=True)
    source_resume_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped[User] = relationship(back_populates="resumes")
    versions: Mapped[list[ResumeVersion]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="desc(ResumeVersion.created_at)",
    )
    ats_reports: Mapped[list[ATSReport]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
        order_by="desc(ATSReport.created_at)",
    )

    __table_args__ = (Index("ix_resumes_user_id_updated_at", "user_id", "updated_at"),)
