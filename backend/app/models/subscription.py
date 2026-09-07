from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, JSONColumn, UTCDateTime
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.user import User


class Subscription(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "subscriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan: Mapped[str] = mapped_column(String(32), nullable=False, default="pro")
    # incomplete | active | past_due | canceled | expired
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="incomplete")
    provider: Mapped[str] = mapped_column(String(32), nullable=False, default="noop")
    interval: Mapped[str] = mapped_column(String(16), nullable=False, default="monthly")
    provider_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_subscription_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, index=True
    )
    amount_usd: Mapped[str | None] = mapped_column(String(16), nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    canceled_at: Mapped[datetime | None] = mapped_column(UTCDateTime, nullable=True)
    meta: Mapped[dict[str, Any]] = mapped_column(JSONColumn, nullable=False, default=dict)

    user: Mapped[User] = relationship(back_populates="subscriptions")

    @property
    def is_active(self) -> bool:
        return self.status in {"active", "past_due"}
