from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, JSONColumn
from app.models.base import TimestampMixin, UUIDPrimaryKey


class JobDescription(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "job_descriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Weighted keyword records produced by keyword_service.extract_from_job_description
    extracted_keywords: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONColumn, nullable=False, default=list
    )
