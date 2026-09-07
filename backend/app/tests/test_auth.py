from __future__ import annotations

from fastapi.testclient import TestClient


def test_register_returns_tokens_and_user(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": "New.User@Example.com", "password": "StrongPass123", "fullName": "New User"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "new.user@example.com"
    assert body["user"]["plan"] == "free"
    assert body["accessToken"] and body["refreshToken"]


def test_register_rejects_weak_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": "weak@example.com", "password": "password", "fullName": "Weak"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_register_rejects_duplicate_email(client: TestClient, registered_user: dict) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": "sam.rivera@example.com", "password": "StrongPass123", "fullName": "Sam"},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "conflict"


def test_login_succeeds_and_is_case_insensitive(client: TestClient, registered_user: dict) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": "SAM.RIVERA@example.com", "password": "StrongPass123"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["fullName"] == "Sam Rivera"


def test_login_with_bad_password_is_unauthorised(client: TestClient, registered_user: dict) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": "sam.rivera@example.com", "password": "WrongPass123"},
    )
    assert response.status_code == 401
    # The message must not reveal whether the account exists.
    assert response.json()["error"]["message"] == "Incorrect email or password."


def test_password_is_never_stored_in_plain_text(client: TestClient, registered_user: dict) -> None:
    from app.models import User
    from app.tests.conftest import TestSession

    with TestSession() as session:
        user = session.query(User).filter(User.email == "sam.rivera@example.com").one()
    assert "StrongPass123" not in user.password_hash
    assert user.password_hash.startswith("$2")


def test_me_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401


def test_me_returns_current_user(client: TestClient, auth_headers: dict) -> None:
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "sam.rivera@example.com"


def test_refresh_rotates_the_token(client: TestClient, registered_user: dict) -> None:
    original = registered_user["refreshToken"]
    response = client.post("/api/auth/refresh", json={"refreshToken": original})
    assert response.status_code == 200
    rotated = response.json()["refreshToken"]
    assert rotated != original

    # Reusing the old token invalidates the whole family.
    replay = client.post("/api/auth/refresh", json={"refreshToken": original})
    assert replay.status_code == 401
    assert client.post("/api/auth/refresh", json={"refreshToken": rotated}).status_code == 401


def test_logout_revokes_the_refresh_token(client: TestClient, registered_user: dict) -> None:
    token = registered_user["refreshToken"]
    assert client.post("/api/auth/logout", json={"refreshToken": token}).status_code == 200
    assert client.post("/api/auth/refresh", json={"refreshToken": token}).status_code == 401


def test_forgot_password_does_not_leak_account_existence(client: TestClient) -> None:
    known = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    assert known.status_code == 200
    assert "on its way" in known.json()["message"]


def test_email_verification_flow(client: TestClient, registered_user: dict) -> None:
    from app.core.security import create_email_token

    user_id = registered_user["user"]["id"]
    token = create_email_token(user_id, "email_verify")
    response = client.post("/api/auth/verify-email", json={"token": token})
    assert response.status_code == 200
    assert response.json()["isVerified"] is True


def test_verify_email_rejects_wrong_token_type(client: TestClient, registered_user: dict) -> None:
    from app.core.security import create_email_token

    token = create_email_token(registered_user["user"]["id"], "password_reset")
    response = client.post("/api/auth/verify-email", json={"token": token})
    assert response.status_code == 422


def test_change_password_signs_out_other_sessions(
    client: TestClient, registered_user: dict, auth_headers: dict
) -> None:
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"currentPassword": "StrongPass123", "newPassword": "EvenStronger456"},
    )
    assert response.status_code == 200
    assert (
        client.post(
            "/api/auth/refresh", json={"refreshToken": registered_user["refreshToken"]}
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/auth/login",
            json={"email": "sam.rivera@example.com", "password": "EvenStronger456"},
        ).status_code
        == 200
    )


def test_login_is_rate_limited(client: TestClient, registered_user: dict) -> None:
    codes = [
        client.post(
            "/api/auth/login", json={"email": "sam.rivera@example.com", "password": "Nope12345"}
        ).status_code
        for _ in range(12)
    ]
    assert 429 in codes


def test_health_endpoints(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/health/ready").json()["status"] in {"ok", "degraded"}
