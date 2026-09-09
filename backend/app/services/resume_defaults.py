"""Section catalogue and the starting document for a new resume.

`SECTION_CATALOG` is the authoritative list of section types. The frontend
mirrors it in `src/features/resume/sections.ts`; both derive their behaviour
(payload shape, default title, whether it can repeat) from the same definitions.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any

from app.schemas.resume_data import ResumeData, ResumeSettings


@dataclass(frozen=True)
class SectionDefinition:
    type: str
    kind: str
    title: str
    description: str
    group: str
    #: Included when a blank resume is created.
    default: bool = False
    #: Some sections (custom, list-style) may appear more than once.
    repeatable: bool = False
    #: Roles or levels this section tends to help.
    suggested_for: list[str] = field(default_factory=list)


SECTION_CATALOG: tuple[SectionDefinition, ...] = (
    SectionDefinition(
        "summary",
        "text",
        "Professional Summary",
        "Two to four lines describing what you do and the value you bring.",
        "core",
        default=True,
    ),
    SectionDefinition(
        "objective",
        "text",
        "Career Objective",
        "A short statement of the role you are targeting. Best for students and career changers.",
        "core",
        suggested_for=["student", "fresher"],
    ),
    SectionDefinition(
        "experience",
        "experience",
        "Work Experience",
        "Roles, companies, dates and what you achieved in each.",
        "core",
        default=True,
    ),
    SectionDefinition(
        "internships",
        "experience",
        "Internships",
        "Internships listed separately from full-time roles.",
        "core",
        suggested_for=["student", "fresher"],
    ),
    SectionDefinition(
        "education",
        "education",
        "Education",
        "Degrees, institutions and dates.",
        "core",
        default=True,
    ),
    SectionDefinition(
        "technical-skills",
        "skills",
        "Technical Skills",
        "Tools, languages and platforms, grouped by category as plain text.",
        "core",
        default=True,
    ),
    SectionDefinition(
        "soft-skills",
        "skills",
        "Soft Skills",
        "Communication, leadership and collaboration strengths.",
        "additional",
    ),
    SectionDefinition(
        "projects",
        "projects",
        "Projects",
        "Work you have built, with the technologies used and the outcome.",
        "core",
        default=True,
    ),
    SectionDefinition(
        "certifications",
        "certifications",
        "Certifications",
        "Professional certifications with the issuing body and date.",
        "core",
    ),
    SectionDefinition(
        "awards", "list", "Awards", "Recognition you have received.", "achievements"
    ),
    SectionDefinition(
        "achievements",
        "list",
        "Achievements",
        "Measurable accomplishments that do not belong to a single role.",
        "achievements",
    ),
    SectionDefinition(
        "publications",
        "publications",
        "Publications",
        "Papers, articles and books you have authored.",
        "academic",
        suggested_for=["academic", "research"],
    ),
    SectionDefinition(
        "research",
        "publications",
        "Research",
        "Research projects, labs and areas of focus.",
        "academic",
        suggested_for=["academic", "research"],
    ),
    SectionDefinition(
        "volunteer", "experience", "Volunteer Experience", "Unpaid work and community roles.", "additional"
    ),
    SectionDefinition(
        "leadership",
        "experience",
        "Leadership",
        "Positions of responsibility in clubs, societies or teams.",
        "additional",
        suggested_for=["student", "fresher"],
    ),
    SectionDefinition(
        "languages",
        "languages",
        "Languages",
        "Languages you speak, with a written proficiency level.",
        "additional",
    ),
    SectionDefinition(
        "interests", "tags", "Interests", "A short line of relevant interests.", "additional"
    ),
    SectionDefinition(
        "courses", "list", "Courses", "Relevant courses you have completed.", "learning"
    ),
    SectionDefinition(
        "training", "list", "Training", "Workshops, bootcamps and professional training.", "learning"
    ),
    SectionDefinition(
        "conferences",
        "list",
        "Conferences",
        "Conferences and events you attended or spoke at.",
        "learning",
    ),
    SectionDefinition(
        "memberships",
        "list",
        "Professional Memberships",
        "Professional bodies you belong to.",
        "additional",
    ),
    SectionDefinition(
        "references",
        "references",
        "References",
        "Referees, or a line stating they are available on request.",
        "additional",
    ),
    SectionDefinition(
        "custom",
        "list",
        "Custom Section",
        "Anything the standard sections do not cover.",
        "additional",
        repeatable=True,
    ),
)

SECTION_BY_TYPE: dict[str, SectionDefinition] = {item.type: item for item in SECTION_CATALOG}

#: Sections an ATS expects to find. Used by the completeness check.
ESSENTIAL_SECTIONS = ("experience", "education", "technical-skills")


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


def _empty_payload(kind: str) -> dict[str, Any]:
    if kind == "text":
        return {"content": ""}
    if kind == "skills":
        return {"groups": [], "display": "grouped"}
    if kind == "tags":
        return {"tags": []}
    if kind == "references":
        return {"items": [], "hideDetails": False}
    return {"items": []}


def make_section(section_type: str, *, title: str | None = None) -> dict[str, Any]:
    definition = SECTION_BY_TYPE[section_type]
    return {
        "id": _new_id(),
        "type": definition.type,
        "kind": definition.kind,
        "title": title or definition.title,
        "visible": True,
        **_empty_payload(definition.kind),
    }


def blank_resume_data() -> dict[str, Any]:
    """A new resume: the default sections, in the order an ATS expects them."""
    data = {
        "version": 1,
        "personal": {
            "fullName": "",
            "title": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
            "website": "",
            "links": [],
            "photo": "",
        },
        "sections": [make_section(item.type) for item in SECTION_CATALOG if item.default],
    }
    # Validate through the canonical model so defaults can never drift.
    return ResumeData.model_validate(data).model_dump(by_alias=True)


def default_settings() -> dict[str, Any]:
    return ResumeSettings().model_dump(by_alias=True)


def section_catalog_payload() -> list[dict[str, Any]]:
    return [
        {
            "type": item.type,
            "kind": item.kind,
            "title": item.title,
            "description": item.description,
            "group": item.group,
            "default": item.default,
            "repeatable": item.repeatable,
            "suggestedFor": item.suggested_for,
        }
        for item in SECTION_CATALOG
    ]
