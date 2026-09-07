"""Test fixtures. Tests run against a throwaway SQLite database so the suite
needs no external services; `JSONColumn` degrades from JSONB to JSON there.
"""

from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-value-for-the-resumeforge-suite")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("EMAIL_PROVIDER", "console")
os.environ.setdefault("PAYMENT_PROVIDER", "noop")
os.environ.setdefault("AI_PROVIDER", "rules")

from app.core.database import Base, get_db  # noqa: E402
from app.core.rate_limit import store as rate_limit_store  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402

test_engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


@pytest.fixture(autouse=True)
def _reset_database() -> Generator[None, None, None]:
    Base.metadata.create_all(test_engine)
    rate_limit_store.reset()
    yield
    Base.metadata.drop_all(test_engine)


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    def _override() -> Generator[Session, None, None]:
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client: TestClient) -> dict:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "sam.rivera@example.com",
            "password": "StrongPass123",
            "fullName": "Sam Rivera",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


@pytest.fixture
def auth_headers(registered_user: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {registered_user['accessToken']}"}


@pytest.fixture
def pro_headers(registered_user: dict, db: Session) -> dict[str, str]:
    """Upgrade the fixture user to Pro and mint a fresh token carrying the plan."""
    from app.core.security import create_access_token

    user = db.query(User).filter(User.email == "sam.rivera@example.com").one()
    user.plan = "pro"
    db.commit()
    token = create_access_token(str(user.id), role=user.role, plan="pro")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client: TestClient, db: Session) -> dict[str, str]:
    from app.core.security import create_access_token, hash_password

    admin = User(
        email="admin@example.com",
        password_hash=hash_password("AdminPass123"),
        full_name="Ada Admin",
        role="admin",
        plan="pro",
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    token = create_access_token(str(admin.id), role="admin", plan="pro")
    return {"Authorization": f"Bearer {token}"}
