"""Flatten a ResumeData document into text and structured facts.

The ATS engine, the keyword matcher and the DOCX exporter all work from these
helpers so they can never disagree about what a resume actually says.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any

MONTHS = (
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
)


def parse_partial_date(value: str) -> tuple[int, int] | None:
    """`"2024-03"` or `"2024"` -> `(year, month)`. Month defaults to 1."""
    if not value:
        return None
    parts = value.split("-")
    try:
        year = int(parts[0])
    except (ValueError, IndexError):
        return None
    if year < 1900 or year > 2100:
        return None
    month = 1
    if len(parts) > 1:
        try:
            month = min(12, max(1, int(parts[1])))
        except ValueError:
            month = 1
    return year, month


def format_partial_date(value: str, style: str = "short-month") -> str:
    parsed = parse_partial_date(value)
    if parsed is None:
        return value or ""
    year, month = parsed
    has_month = "-" in value
    if style == "year-only" or not has_month:
        return str(year)
    if style == "numeric":
        return f"{month:02d}/{year}"
    if style == "long-month":
        return f"{MONTHS[month - 1]} {year}"
    return f"{MONTHS[month - 1][:3]} {year}"


def format_date_range(start: str, end: str, current: bool, style: str = "short-month") -> str:
    left = format_partial_date(start, style)
    right = "Present" if current else format_partial_date(end, style)
    if left and right:
        return f"{left} – {right}"
    return left or right or ""


def months_between(start: str, end: str, current: bool) -> int:
    start_parsed = parse_partial_date(start)
    if start_parsed is None:
        return 0
    if current:
        today = date.today()
        end_parsed = (today.year, today.month)
    else:
        end_parsed = parse_partial_date(end) or start_parsed
    months = (end_parsed[0] - start_parsed[0]) * 12 + (end_parsed[1] - start_parsed[1])
    return max(0, months)


@dataclass
class ResumeFacts:
    """Everything the analysis layers need, derived once."""

    full_text: str = ""
    #: Section type -> text, so we can report *where* a keyword appears.
    text_by_section: dict[str, str] = field(default_factory=dict)
    bullets: list[str] = field(default_factory=list)
    skills: list[str] = field(default_factory=list)
    job_titles: list[str] = field(default_factory=list)
    companies: list[str] = field(default_factory=list)
    degrees: list[str] = field(default_factory=list)
    institutions: list[str] = field(default_factory=list)
    technologies: list[str] = field(default_factory=list)
    section_types: list[str] = field(default_factory=list)
    visible_section_types: list[str] = field(default_factory=list)
    experience_months: int = 0
    experience_count: int = 0
    education_count: int = 0
    project_count: int = 0
    certification_count: int = 0
    word_count: int = 0
    has_email: bool = False
    has_phone: bool = False
    has_name: bool = False
    has_location: bool = False
    has_links: bool = False
    summary_text: str = ""


def _text_of_section(section: dict[str, Any]) -> str:
    kind = section.get("kind")
    parts: list[str] = [str(section.get("title", ""))]

    if kind == "text":
        parts.append(str(section.get("content", "")))
    elif kind == "skills":
        for group in section.get("groups", []) or []:
            parts.append(str(group.get("name", "")))
            parts.extend(str(skill) for skill in group.get("skills", []) or [])
    elif kind == "tags":
        parts.extend(str(tag) for tag in section.get("tags", []) or [])
    else:
        for item in section.get("items", []) or []:
            for key, value in item.items():
                if key == "id":
                    continue
                if isinstance(value, str):
                    parts.append(value)
                elif isinstance(value, list):
                    parts.extend(str(entry) for entry in value)
    return "\n".join(part for part in parts if part)


def extract_facts(data: dict[str, Any]) -> ResumeFacts:
    facts = ResumeFacts()
    personal = data.get("personal") or {}

    facts.has_name = bool(str(personal.get("fullName", "")).strip())
    facts.has_email = bool(str(personal.get("email", "")).strip())
    facts.has_phone = bool(str(personal.get("phone", "")).strip())
    facts.has_location = bool(str(personal.get("location", "")).strip())
    facts.has_links = any(
        str(personal.get(key, "")).strip()
        for key in ("linkedin", "github", "portfolio", "website")
    ) or bool(personal.get("links"))

    chunks: list[str] = [
        str(personal.get(key, ""))
        for key in ("fullName", "title", "email", "phone", "location", "linkedin", "github", "portfolio", "website")
    ]

    for section in data.get("sections", []) or []:
        section_type = str(section.get("type", ""))
        kind = section.get("kind")
        facts.section_types.append(section_type)
        if section.get("visible", True):
            facts.visible_section_types.append(section_type)

        section_text = _text_of_section(section)
        facts.text_by_section[section_type] = section_text
        chunks.append(section_text)

        if kind == "text" and section_type in {"summary", "objective"}:
            facts.summary_text = str(section.get("content", ""))

        if kind == "experience":
            items = section.get("items", []) or []
            if section_type in {"experience", "internships"}:
                facts.experience_count += len(items)
            for item in items:
                if item.get("title"):
                    facts.job_titles.append(str(item["title"]))
                if item.get("company"):
                    facts.companies.append(str(item["company"]))
                facts.bullets.extend(str(bullet) for bullet in item.get("bullets", []) or [])
                facts.technologies.extend(str(tech) for tech in item.get("technologies", []) or [])
                if section_type == "experience":
                    facts.experience_months += months_between(
                        str(item.get("startDate", "")),
                        str(item.get("endDate", "")),
                        bool(item.get("current")),
                    )
        elif kind == "education":
            items = section.get("items", []) or []
            facts.education_count += len(items)
            for item in items:
                degree = " ".join(
                    part for part in (str(item.get("degree", "")), str(item.get("field", ""))) if part
                )
                if degree:
                    facts.degrees.append(degree)
                if item.get("institution"):
                    facts.institutions.append(str(item["institution"]))
                facts.bullets.extend(str(bullet) for bullet in item.get("bullets", []) or [])
        elif kind == "skills":
            for group in section.get("groups", []) or []:
                facts.skills.extend(str(skill) for skill in group.get("skills", []) or [])
        elif kind == "projects":
            items = section.get("items", []) or []
            facts.project_count += len(items)
            for item in items:
                facts.bullets.extend(str(bullet) for bullet in item.get("bullets", []) or [])
                facts.technologies.extend(str(tech) for tech in item.get("technologies", []) or [])
        elif kind == "certifications":
            facts.certification_count += len(section.get("items", []) or [])
        elif kind == "tags":
            facts.skills.extend(str(tag) for tag in section.get("tags", []) or [])

    facts.full_text = "\n".join(chunk for chunk in chunks if chunk)
    facts.word_count = len([word for word in facts.full_text.split() if word.strip()])
    return facts


def to_plain_text(data: dict[str, Any]) -> str:
    """Human-readable plain text, used for copy/paste and DOCX fallbacks."""
    return extract_facts(data).full_text
