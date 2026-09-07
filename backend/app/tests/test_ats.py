from app.services.ats_service import DISCLAIMER, analyze
from app.services.keyword_service import extract_keywords, match_keywords
from app.services.resume_defaults import blank_resume_data


def _sample_resume() -> dict:
    data = blank_resume_data()
    data["personal"]["fullName"] = "Sam Rivera"
    data["personal"]["email"] = "sam@example.com"
    data["personal"]["phone"] = "+1 555 0100"
    for section in data["sections"]:
        if section["type"] == "summary":
            section["content"] = (
                "Software engineer building web applications with React and TypeScript."
            )
        if section["type"] == "experience":
            section["items"] = [
                {
                    "id": "e1",
                    "title": "Software Engineer",
                    "company": "Northwind Labs",
                    "location": "Remote",
                    "startDate": "2022-01",
                    "endDate": "",
                    "current": True,
                    "description": "",
                    "bullets": [
                        "Developed a React and TypeScript interface used by the operations team.",
                        "Implemented REST APIs with FastAPI and PostgreSQL.",
                    ],
                    "technologies": ["React", "TypeScript", "FastAPI"],
                }
            ]
        if section["type"] == "technical-skills":
            section["groups"] = [
                {
                    "id": "g1",
                    "name": "Languages",
                    "skills": ["Python", "TypeScript", "JavaScript"],
                },
                {"id": "g2", "name": "Frameworks", "skills": ["React", "FastAPI"]},
            ]
        if section["type"] == "education":
            section["items"] = [
                {
                    "id": "ed1",
                    "degree": "B.S.",
                    "field": "Computer Science",
                    "institution": "Example University",
                    "location": "",
                    "startDate": "2018",
                    "endDate": "2022",
                    "current": False,
                    "gpa": "",
                    "coursework": [],
                    "bullets": [],
                }
            ]
    return data


def test_keyword_extraction_weights_technologies():
    text = "We require React, TypeScript, Docker and strong communication skills."
    keywords = extract_keywords(text)
    terms = {item.term: item.weight for item in keywords}
    assert "React" in terms
    assert "TypeScript" in terms
    assert terms["React"] > terms.get("Communication", 0)


def test_keyword_match_ignores_generic_words():
    resume = "Built React apps with TypeScript and FastAPI."
    keywords = extract_keywords("Looking for a candidate with React TypeScript AWS communication")
    matched, missing, score = match_keywords(resume, keywords)
    matched_terms = {item["term"] for item in matched}
    missing_terms = {item["term"] for item in missing}
    assert "React" in matched_terms
    assert "AWS" in missing_terms
    assert 0 < score < 100


def test_ats_analyze_explains_score():
    report = analyze(_sample_resume(), template_id="classic-ats")
    assert 50 <= report["overallScore"] <= 100
    assert report["headline"]
    assert report["disclaimer"] == DISCLAIMER
    assert report["breakdown"]
    assert any(entry["key"] == "formatting" for entry in report["breakdown"])


def test_job_match_lists_missing_keywords():
    report = analyze(
        _sample_resume(),
        template_id="classic-ats",
        job_text="Required: React, TypeScript, AWS, Kubernetes. Preferred: Docker.",
        job_title="Frontend Engineer",
        company="Acme",
    )
    missing = {item["term"] for item in report["missingKeywords"]}
    assert "AWS" in missing or "Kubernetes" in missing
    assert report["kind"] == "job_match"
    assert report["placementGuidance"]


def test_analyze_endpoint(client, auth_headers):
    created = client.post("/api/resumes", headers=auth_headers, json={"title": "Eng"})
    assert created.status_code == 201
    resume_id = created.json()["id"]
    client.patch(
        f"/api/resumes/{resume_id}",
        headers=auth_headers,
        json={"data": _sample_resume(), "autosave": True},
    )
    response = client.post(
        "/api/ats/analyze",
        headers=auth_headers,
        json={"resumeId": resume_id},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert "overallScore" in body
    assert body["disclaimer"]


def test_job_match_endpoint(client, auth_headers):
    created = client.post("/api/resumes", headers=auth_headers, json={"title": "Eng"})
    resume_id = created.json()["id"]
    client.patch(
        f"/api/resumes/{resume_id}",
        headers=auth_headers,
        json={"data": _sample_resume(), "autosave": True},
    )
    response = client.post(
        "/api/ats/job-match",
        headers=auth_headers,
        json={
            "resumeId": resume_id,
            "jobTitle": "Software Engineer",
            "company": "Acme",
            "jobDescription": "We need React, TypeScript, Docker and AWS experience for this role.",
        },
    )
    assert response.status_code == 200, response.text
    assert response.json()["kind"] == "job_match"
