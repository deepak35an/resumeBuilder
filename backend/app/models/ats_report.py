from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, JSONColumn
from app.models.base import CreatedAtMixin, UUIDPrimaryKey


class ATSReport(UUIDPrimaryKey, CreatedAtMixin, Base):
    __tablename__ = "ats_reports"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True, index=True
    )
    job_description_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True
    )
    # ats_check | job_match
    kind: Mapped[str] = mapped_column(String(24), nullable=False, default="ats_check")
    source: Mapped[str] = mapped_column(String(24), nullable=False, default="builder")

    overall_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    formatting_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    keyword_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    content_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    experience_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skills_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    education_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completeness_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    match_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    issues: Mapped[list[dict[str, Any]]] = mapped_column(JSONColumn, nullable=False, default=list)
    recommendations: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONColumn, nullable=False, default=list
    )
    strengths: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONColumn, nullable=False, default=list
    )
    matched_keywords: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONColumn, nullable=False, default=list
    )
    missing_keywords: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONColumn, nullable=False, default=list
    )
    sections: Mapped[list[dict[str, Any]]] = mapped_column(JSONColumn, nullable=False, default=list)
    summary: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)

    resume = relationship("Resume", back_populates="ats_reports")
    job_description = relationship("JobDescription")

    __table_args__ = (Index("ix_ats_reports_user_created", "user_id", "created_at"),)
