"""Database engine, session factory and the shared declarative base.

`JSONColumn` resolves to native JSONB on PostgreSQL and plain JSON elsewhere so
the same models can be exercised against SQLite in tests.
"""

from __future__ import annotations

from collections.abc import Generator
from datetime import UTC, datetime

from sqlalchemy import DateTime, MetaData, create_engine, types
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class JSONColumn(types.TypeDecorator):
    """Portable JSON column: JSONB on PostgreSQL, JSON everywhere else."""

    impl = types.JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):  # noqa: ANN001, ANN201
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(types.JSON())


class UTCDateTime(types.TypeDecorator):
    """Timezone-aware datetime that normalises naive values to UTC."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_result_value(self, value, dialect):  # noqa: ANN001, ANN201
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


def utcnow() -> datetime:
    return datetime.now(UTC)


def _engine_kwargs() -> dict:
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True, "pool_size": 10, "max_overflow": 20}


engine = create_engine(settings.DATABASE_URL, future=True, **_engine_kwargs())
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
