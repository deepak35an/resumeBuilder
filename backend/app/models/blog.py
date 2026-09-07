from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, JSONColumn, UTCDateTime
from app.models.base import TimestampMixin, UUIDPrimaryKey


class BlogPost(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "blog_posts"

    title: Mapped[str] = mapped_column(String(240), nullable=False)
    slug: Mapped[str] = mapped_column(String(240), unique=True, index=True, nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    author: Mapped[str] = mapped_column(String(120), nullable=False, default="ResumeForge Team")
    cover_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
    category: Mapped[str] = mapped_column(String(64), nullable=False, default="Resume Advice")
    tags: Mapped[list[str]] = mapped_column(JSONColumn, nullable=False, default=list)
    reading_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    seo_title: Mapped[str | None] = mapped_column(String(240), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(400), nullable=True)
