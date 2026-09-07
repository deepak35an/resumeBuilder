from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, JSONColumn
from app.models.base import CreatedAtMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.resume import Resume


class ResumeVersion(UUIDPrimaryKey, CreatedAtMixin, Base):
    __tablename__ = "resume_versions"

    resume_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_name: Mapped[str] = mapped_column(String(160), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    data: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
    settings: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
    template_id: Mapped[str] = mapped_column(String(64), nullable=False, default="classic-ats")
    ats_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # manual | autosave | restore | import
    trigger: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")

    resume: Mapped[Resume] = relationship(back_populates="versions")

    __table_args__ = (Index("ix_resume_versions_resume_created", "resume_id", "created_at"),)
