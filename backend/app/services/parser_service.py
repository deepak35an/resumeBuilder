"""Resume import: extract text from PDF/DOCX and heuristic section parsing.

Parsing is never treated as perfect. Callers must show a review notice.
"""

from __future__ import annotations

import io
import re
from typing import Any

from app.core.errors import ValidationError_
from app.services.resume_defaults import blank_resume_data

ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
}
ALLOWED_EXT = {".pdf", ".docx", ".txt"}

NOTICE = "Review imported content before downloading. Parsing is an estimate."

EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)")
URL_RE = re.compile(r"https?://[^\s)]+", re.I)

HEADINGS = [
    ("summary", re.compile(r"^(professional\s+)?summary|profile|about me$", re.I)),
    ("objective", re.compile(r"^(career\s+)?objective$", re.I)),
    ("experience", re.compile(r"^(work\s+)?experience|employment|professional experience$", re.I)),
    ("internships", re.compile(r"^internships?$", re.I)),
    ("education", re.compile(r"^education|academics$", re.I)),
    ("technical-skills", re.compile(r"^(technical\s+)?skills|technologies|tech stack$", re.I)),
    ("projects", re.compile(r"^projects?$", re.I)),
    ("certifications", re.compile(r"^certifications?|licen[cs]es$", re.I)),
    ("awards", re.compile(r"^awards?|honou?rs$", re.I)),
    ("publications", re.compile(r"^publications?$", re.I)),
    ("languages", re.compile(r"^languages?$", re.I)),
]


def validate_upload(filename: str, content_type: str | None, size: int, max_bytes: int) -> None:
    name = (filename or "").lower()
    ext = "." + name.rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ALLOWED_EXT:
        raise ValidationError_(
            "Upload a PDF, DOCX or plain-text file.",
            details=[{"field": "file", "message": "Unsupported file type."}],
        )
    if ext in {".exe", ".js", ".bat", ".cmd", ".ps1", ".sh"}:
        raise ValidationError_("That file type is not allowed.")
    if size > max_bytes:
        raise ValidationError_(
            f"Files must be smaller than {max_bytes // (1024 * 1024)} MB.",
            details=[{"field": "file", "message": "File too large."}],
        )
    if content_type and content_type not in ALLOWED_MIME and content_type != "application/octet-stream":
        raise ValidationError_(
            "That file type is not allowed.",
            details=[{"field": "file", "message": "Unexpected MIME type."}],
        )


def extract_text(filename: str, payload: bytes) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        return _pdf_text(payload)
    if name.endswith(".docx"):
        return _docx_text(payload)
    return payload.decode("utf-8", errors="replace")


def _pdf_text(payload: bytes) -> str:
    try:
        import pdfplumber

        chunks: list[str] = []
        with pdfplumber.open(io.BytesIO(payload)) as pdf:
            for page in pdf.pages:
                chunks.append(page.extract_text() or "")
        text = "\n".join(chunks).strip()
        if text:
            return text
    except Exception:  # noqa: BLE001
        pass
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(payload))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def _docx_text(payload: bytes) -> str:
    from docx import Document

    document = Document(io.BytesIO(payload))
    return "\n".join(p.text for p in document.paragraphs)


def _heading_type(line: str) -> str | None:
    stripped = line.strip()
    if len(stripped) > 48:
        return None
    for section_type, pattern in HEADINGS:
        if pattern.match(stripped):
            return section_type
    return None


def parse_resume_text(text: str) -> dict[str, Any]:
    data = blank_resume_data()
    warnings: list[str] = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        warnings.append("No extractable text was found. The file may be image-only.")
        return {
            "data": data,
            "warnings": warnings,
            "detected": _detected(data),
            "rawTextLength": 0,
            "notice": NOTICE,
        }

    personal = data["personal"]
    emails = EMAIL_RE.findall(text)
    phones = PHONE_RE.findall(text)
    urls = URL_RE.findall(text)
    if emails:
        personal["email"] = emails[0]
    else:
        warnings.append("No email address was detected.")
    if phones:
        personal["phone"] = phones[0].strip()
    for url in urls:
        low = url.lower()
        if "linkedin.com" in low and not personal["linkedin"]:
            personal["linkedin"] = url
        elif "github.com" in low and not personal["github"]:
            personal["github"] = url
        elif not personal["website"]:
            personal["website"] = url

    # First non-contact line is treated as the name.
    for line in lines[:6]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line) or _heading_type(line):
            continue
        if 2 <= len(line.split()) <= 5 and line[0].isupper():
            personal["fullName"] = line
            break
    if not personal["fullName"]:
        warnings.append("Name could not be detected confidently.")

    buckets: dict[str, list[str]] = {}
    current = "summary"
    for line in lines:
        heading = _heading_type(line)
        if heading:
            current = heading
            buckets.setdefault(current, [])
            continue
        buckets.setdefault(current, []).append(line)

    sections = {s["type"]: s for s in data["sections"]}

    if buckets.get("summary"):
        sections["summary"]["content"] = " ".join(buckets["summary"][:8])

    if buckets.get("experience"):
        sections["experience"]["items"] = _parse_experience(buckets["experience"])
        if not sections["experience"]["items"]:
            warnings.append("Experience was found but roles could not be split cleanly.")

    if buckets.get("education"):
        sections["education"]["items"] = _parse_education(buckets["education"])

    if buckets.get("technical-skills"):
        skills = _parse_skills(buckets["technical-skills"])
        if skills:
            sections["technical-skills"]["groups"] = [
                {"id": "imported-skills", "name": "Skills", "skills": skills}
            ]

    if buckets.get("projects"):
        sections["projects"]["items"] = _parse_projects(buckets["projects"])

    if buckets.get("certifications"):
        sections["certifications"]["items"] = [
            {
                "id": f"cert-{index}",
                "name": line,
                "issuer": "",
                "date": "",
                "expiry": "",
                "credentialId": "",
                "credentialUrl": "",
            }
            for index, line in enumerate(buckets["certifications"][:8])
        ]

    warnings.append("Please review every imported field before treating this as complete.")
    return {
        "data": data,
        "warnings": warnings,
        "detected": _detected(data),
        "rawTextLength": len(text),
        "notice": NOTICE,
    }


def _parse_experience(lines: list[str]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for line in lines:
        if line.startswith(("-", "•", "*")):
            if current is not None:
                current["bullets"].append(line.lstrip("-•* ").strip())
            continue
        if current:
            items.append(current)
        current = {
            "id": f"exp-{len(items)}",
            "title": line,
            "company": "",
            "location": "",
            "startDate": "",
            "endDate": "",
            "current": False,
            "description": "",
            "bullets": [],
            "technologies": [],
        }
    if current:
        items.append(current)
    return items[:12]


def _parse_education(lines: list[str]) -> list[dict[str, Any]]:
    items = []
    for index, line in enumerate(lines[:6]):
        items.append(
            {
                "id": f"edu-{index}",
                "degree": line,
                "field": "",
                "institution": "",
                "location": "",
                "startDate": "",
                "endDate": "",
                "current": False,
                "gpa": "",
                "coursework": [],
                "bullets": [],
            }
        )
    return items


def _parse_skills(lines: list[str]) -> list[str]:
    skills: list[str] = []
    for line in lines:
        line = re.sub(r"^[A-Za-z ]+:\s*", "", line)
        for part in re.split(r"[,|/•;]", line):
            token = part.strip()
            if 1 < len(token) < 40:
                skills.append(token)
    # Deduplicate preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for skill in skills:
        key = skill.lower()
        if key not in seen:
            seen.add(key)
            unique.append(skill)
    return unique[:40]


def _parse_projects(lines: list[str]) -> list[dict[str, Any]]:
    items = []
    current = None
    for line in lines:
        if line.startswith(("-", "•", "*")) and current:
            current["bullets"].append(line.lstrip("-•* ").strip())
            continue
        if current:
            items.append(current)
        current = {
            "id": f"proj-{len(items)}",
            "name": line,
            "role": "",
            "description": "",
            "technologies": [],
            "url": "",
            "github": "",
            "startDate": "",
            "endDate": "",
            "bullets": [],
        }
    if current:
        items.append(current)
    return items[:10]


def _detected(data: dict[str, Any]) -> dict[str, Any]:
    personal = data.get("personal") or {}
    sections = {s["type"]: s for s in data.get("sections", [])}
    return {
        "name": bool(personal.get("fullName")),
        "email": bool(personal.get("email")),
        "phone": bool(personal.get("phone")),
        "experience": len((sections.get("experience") or {}).get("items") or []),
        "education": len((sections.get("education") or {}).get("items") or []),
        "skills": sum(
            len(g.get("skills") or [])
            for g in (sections.get("technical-skills") or {}).get("groups") or []
        ),
        "projects": len((sections.get("projects") or {}).get("items") or []),
        "certifications": len((sections.get("certifications") or {}).get("items") or []),
    }
