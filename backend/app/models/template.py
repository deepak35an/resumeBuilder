from __future__ import annotations

from typing import Any

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, JSONColumn
from app.models.base import TimestampMixin, UUIDPrimaryKey


class Template(UUIDPrimaryKey, TimestampMixin, Base):
    """Template metadata. Rendering lives in the frontend template components;
    this table stores discovery data, gating and admin toggles."""

    __tablename__ = "templates"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(48), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # 1-5. 5 = most conservative / most parseable. Never presented as a guarantee.
    ats_rating: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    preview_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    layout: Mapped[str] = mapped_column(String(32), nullable=False, default="single-column")
    style: Mapped[str] = mapped_column(String(32), nullable=False, default="classic")
    experience_levels: Mapped[list[str]] = mapped_column(JSONColumn, nullable=False, default=list)
    industries: Mapped[list[str]] = mapped_column(JSONColumn, nullable=False, default=list)
    badges: Mapped[list[str]] = mapped_column(JSONColumn, nullable=False, default=list)
    popularity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    template_config: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)
