from __future__ import annotations

from fastapi.testclient import TestClient


def sample_payload() -> dict:
    return {
        "title": "Backend Engineer",
        "templateId": "classic-ats",
        "data": {
            "version": 1,
            "personal": {
                "fullName": "Sam Rivera",
                "title": "Backend Engineer",
                "email": "sam.rivera@example.com",
                "phone": "+1 555 0100",
                "location": "Austin, TX",
            },
            "sections": [
                {
                    "id": "sec-summary",
                    "type": "summary",
                    "kind": "text",
                    "title": "Professional Summary",
                    "visible": True,
                    "content": "Backend engineer with six years building payment systems.",
                },
                {
                    "id": "sec-exp",
                    "type": "experience",
                    "kind": "experience",
                    "title": "Work Experience",
                    "visible": True,
                    "items": [
                        {
                            "id": "exp-1",
                            "title": "Senior Backend Engineer",
                            "company": "Northwind Payments",
                            "startDate": "2021-03",
                            "endDate": "",
                            "current": True,
                            "bullets": [
                                "Reduced settlement latency by 42% by redesigning the ledger writer.",
                                "Led the migration of 38 services to a shared authentication layer.",
                            ],
                            "technologies": ["Python", "PostgreSQL", "Kafka"],
                        }
                    ],
                },
                {
                    "id": "sec-skills",
                    "type": "technical-skills",
                    "kind": "skills",
                    "title": "Technical Skills",
                    "visible": True,
                    "display": "grouped",
                    "groups": [
                        {
                            "id": "grp-1",
                            "name": "Languages",
                            "skills": ["Python", "Go", "SQL"],
                        }
                    ],
                },
            ],
        },
    }


def create_resume(client: TestClient, headers: dict, payload: dict | None = None) -> dict:
    response = client.post("/api/resumes", headers=headers, json=payload or sample_payload())
    assert response.status_code == 201, response.text
    return response.json()


def test_section_catalog_lists_every_type(client: TestClient) -> None:
    response = client.get("/api/resumes/section-catalog")
    assert response.status_code == 200
    catalog = response.json()
    types = {entry["type"] for entry in catalog}
    assert {"experience", "education", "technical-skills", "projects", "custom"} <= types
    assert len(catalog) >= 23


def test_blank_resume_has_default_sections(client: TestClient) -> None:
    body = client.get("/api/resumes/blank").json()
    section_types = [section["type"] for section in body["data"]["sections"]]
    assert section_types[:3] == ["summary", "experience", "education"]
    assert body["settings"]["pageSize"] == "a4"


def test_create_and_read_resume(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    assert created["title"] == "Backend Engineer"
    assert created["completeness"] > 40

    fetched = client.get(f"/api/resumes/{created['id']}", headers=auth_headers).json()
    assert fetched["data"]["personal"]["fullName"] == "Sam Rivera"
    assert fetched["versionCount"] == 1


def test_resumes_require_authentication(client: TestClient) -> None:
    assert client.get("/api/resumes").status_code == 401


def test_users_cannot_read_another_users_resume(
    client: TestClient, auth_headers: dict, admin_headers: dict
) -> None:
    created = create_resume(client, auth_headers)
    response = client.get(f"/api/resumes/{created['id']}", headers=admin_headers)
    assert response.status_code == 404


def test_update_resume_persists_changes(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    data = created["data"]
    data["personal"]["location"] = "Remote"

    response = client.patch(
        f"/api/resumes/{created['id']}",
        headers=auth_headers,
        json={"title": "Backend Engineer - Fintech", "data": data},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Backend Engineer - Fintech"
    assert response.json()["data"]["personal"]["location"] == "Remote"


def test_invalid_section_kind_is_rejected(client: TestClient, auth_headers: dict) -> None:
    payload = sample_payload()
    payload["data"]["sections"][0]["kind"] = "not-a-kind"
    response = client.post("/api/resumes", headers=auth_headers, json=payload)
    assert response.status_code == 422


def test_autosave_does_not_snapshot_every_time(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    for index in range(4):
        data = created["data"]
        data["personal"]["title"] = f"Engineer {index}"
        client.patch(
            f"/api/resumes/{created['id']}",
            headers=auth_headers,
            json={"data": data, "autosave": True},
        )
    versions = client.get(f"/api/resumes/{created['id']}/versions", headers=auth_headers).json()
    assert len(versions) == 1


def test_manual_save_creates_a_version(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    client.patch(
        f"/api/resumes/{created['id']}",
        headers=auth_headers,
        json={"data": created["data"], "autosave": False},
    )
    versions = client.get(f"/api/resumes/{created['id']}/versions", headers=auth_headers).json()
    assert len(versions) == 2


def test_version_restore_is_pro_only(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    versions = client.get(f"/api/resumes/{created['id']}/versions", headers=auth_headers).json()
    response = client.post(
        f"/api/resumes/{created['id']}/versions/{versions[0]['id']}/restore",
        headers=auth_headers,
    )
    assert response.status_code == 402
    assert response.json()["error"]["code"] == "plan_limit"


def test_pro_user_can_restore_a_version(client: TestClient, pro_headers: dict) -> None:
    created = create_resume(client, pro_headers)
    original_title = created["data"]["personal"]["title"]
    versions = client.get(f"/api/resumes/{created['id']}/versions", headers=pro_headers).json()

    data = created["data"]
    data["personal"]["title"] = "Changed title"
    client.patch(f"/api/resumes/{created['id']}", headers=pro_headers, json={"data": data})

    restored = client.post(
        f"/api/resumes/{created['id']}/versions/{versions[0]['id']}/restore",
        headers=pro_headers,
    )
    assert restored.status_code == 200
    assert restored.json()["data"]["personal"]["title"] == original_title


def test_duplicate_creates_an_independent_copy(client: TestClient, pro_headers: dict) -> None:
    created = create_resume(client, pro_headers)
    copy = client.post(
        f"/api/resumes/{created['id']}/duplicate", headers=pro_headers, json={}
    ).json()
    assert copy["id"] != created["id"]
    assert copy["title"] == "Backend Engineer (copy)"
    assert copy["sourceResumeId"] == created["id"]


def test_free_plan_resume_limit_is_enforced(client: TestClient, auth_headers: dict) -> None:
    for index in range(3):
        payload = sample_payload()
        payload["title"] = f"Resume {index}"
        client.post("/api/resumes", headers=auth_headers, json=payload)

    response = client.post("/api/resumes", headers=auth_headers, json=sample_payload())
    assert response.status_code == 402
    assert "Free plan" in response.json()["error"]["message"]


def test_delete_is_soft_and_restorable(client: TestClient, auth_headers: dict) -> None:
    created = create_resume(client, auth_headers)
    assert client.delete(f"/api/resumes/{created['id']}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/resumes/{created['id']}", headers=auth_headers).status_code == 404
    assert client.get("/api/resumes", headers=auth_headers).json() == []

    restored = client.post(f"/api/resumes/{created['id']}/restore", headers=auth_headers)
    assert restored.status_code == 200
    assert len(client.get("/api/resumes", headers=auth_headers).json()) == 1


def test_json_export_and_import_round_trip(client: TestClient, pro_headers: dict) -> None:
    created = create_resume(client, pro_headers)
    exported = client.get(f"/api/resumes/{created['id']}/export.json", headers=pro_headers)
    assert exported.status_code == 200
    assert 'attachment; filename=' in exported.headers["content-disposition"]

    imported = client.post("/api/resumes/import.json", headers=pro_headers, json=exported.json())
    assert imported.status_code == 201
    assert imported.json()["data"]["personal"]["fullName"] == "Sam Rivera"
