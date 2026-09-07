from app.services.docx_service import build_docx
from app.services.parser_service import parse_resume_text, validate_upload
from app.services.pdf_service import build_pdf
from app.services.resume_defaults import blank_resume_data
from app.tests.test_ats import _sample_resume


def test_validate_upload_rejects_executables():
    try:
        validate_upload("malware.exe", "application/octet-stream", 100, 8_000_000)
    except Exception as exc:
        assert "pdf" in str(exc).lower() or "not allowed" in str(exc).lower()
    else:
        raise AssertionError("executables must be rejected")


def test_parse_resume_text_finds_email():
    text = """Jordan Hale
Software Engineer
jordan.hale@example.com
+1 555 0199

SUMMARY
Builds web applications with React.

EXPERIENCE
Frontend Engineer, Northwind
- Developed a React dashboard

SKILLS
Python, TypeScript, React
"""
    parsed = parse_resume_text(text)
    assert parsed["detected"]["email"]
    assert parsed["detected"]["name"]
    assert "review" in parsed["notice"].lower()


def test_docx_and_pdf_export_bytes():
    data = _sample_resume()
    docx, doc_name = build_docx(data, {"pageSize": "a4"})
    pdf, pdf_name = build_pdf(data, {"pageSize": "a4"})
    assert docx.startswith(b"PK")
    assert pdf.startswith(b"%PDF")
    assert doc_name.endswith(".docx")
    assert pdf_name.endswith(".pdf")


def test_export_pdf_endpoint(client, auth_headers):
    created = client.post("/api/resumes", headers=auth_headers, json={"title": "Export me"})
    resume_id = created.json()["id"]
    client.patch(
        f"/api/resumes/{resume_id}",
        headers=auth_headers,
        json={"data": _sample_resume(), "autosave": True},
    )
    response = client.post("/api/export/pdf", headers=auth_headers, json={"resumeId": resume_id})
    assert response.status_code == 200, response.text
    assert response.content.startswith(b"%PDF")


def test_docx_requires_pro(client, auth_headers):
    created = client.post("/api/resumes", headers=auth_headers, json={"title": "Doc"})
    resume_id = created.json()["id"]
    denied = client.post("/api/export/docx", headers=auth_headers, json={"resumeId": resume_id})
    assert denied.status_code == 402


def test_docx_works_for_pro(client, pro_headers):
    created = client.post("/api/resumes", headers=pro_headers, json={"title": "Doc"})
    resume_id = created.json()["id"]
    allowed = client.post("/api/export/docx", headers=pro_headers, json={"resumeId": resume_id})
    assert allowed.status_code == 200, allowed.text


def test_import_text_endpoint(client, auth_headers):
    response = client.post(
        "/api/resumes/import-text",
        headers=auth_headers,
        json={"text": "Alex Chen\nalex@example.com\nSUMMARY\nEngineer.\nSKILLS\nPython, React\n"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["notice"]


def test_blank_resume_helper():
    data = blank_resume_data()
    assert data["personal"]["fullName"] == ""
    assert any(section["type"] == "experience" for section in data["sections"])
