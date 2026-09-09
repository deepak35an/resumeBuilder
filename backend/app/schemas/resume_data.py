"""The canonical ResumeData document.

This is the single contract shared by the editor, the template engine, the ATS
scoring engine, the resume parser and both exporters. The TypeScript mirror
lives in `frontend/src/types/resume.ts` and must be kept in sync.

Dates are stored as partial ISO strings (``"2024-01"`` or ``"2024"``) and are
formatted for display according to `ResumeSettings.dateFormat`, so a resume can
be re-rendered in any date style without touching the stored data.
"""

from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

# --- Section taxonomy -------------------------------------------------------

SectionType = Literal[
    "summary",
    "objective",
    "experience",
    "internships",
    "education",
    "technical-skills",
    "soft-skills",
    "projects",
    "certifications",
    "awards",
    "achievements",
    "publications",
    "research",
    "volunteer",
    "leadership",
    "languages",
    "interests",
    "courses",
    "training",
    "conferences",
    "references",
    "memberships",
    "custom",
]

SectionKind = Literal[
    "text",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "list",
    "publications",
    "languages",
    "tags",
    "references",
]


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


class Model(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")


# --- Personal information ---------------------------------------------------


class Link(Model):
    id: str = Field(default_factory=_new_id)
    label: str = ""
    url: str = ""


class PersonalInfo(Model):
    """Every field is optional: we never force unnecessary personal data."""

    full_name: str = Field("", alias="fullName")
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    website: str = ""
    links: list[Link] = Field(default_factory=list)
    photo: str = Field("", max_length=400_000)


# --- Section item types -----------------------------------------------------


class ExperienceItem(Model):
    id: str = Field(default_factory=_new_id)
    title: str = ""
    company: str = ""
    location: str = ""
    start_date: str = Field("", alias="startDate")
    end_date: str = Field("", alias="endDate")
    current: bool = False
    description: str = ""
    bullets: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)


class EducationItem(Model):
    id: str = Field(default_factory=_new_id)
    degree: str = ""
    field: str = ""
    institution: str = ""
    location: str = ""
    start_date: str = Field("", alias="startDate")
    end_date: str = Field("", alias="endDate")
    current: bool = False
    gpa: str = ""
    coursework: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)


class SkillGroup(Model):
    id: str = Field(default_factory=_new_id)
    name: str = ""
    skills: list[str] = Field(default_factory=list)


class ProjectItem(Model):
    id: str = Field(default_factory=_new_id)
    name: str = ""
    role: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    url: str = ""
    github: str = ""
    start_date: str = Field("", alias="startDate")
    end_date: str = Field("", alias="endDate")
    bullets: list[str] = Field(default_factory=list)


class CertificationItem(Model):
    id: str = Field(default_factory=_new_id)
    name: str = ""
    issuer: str = ""
    date: str = ""
    expiry: str = ""
    credential_id: str = Field("", alias="credentialId")
    credential_url: str = Field("", alias="credentialUrl")


class ListItem(Model):
    """Generic entry used by awards, achievements, courses, training, etc."""

    id: str = Field(default_factory=_new_id)
    title: str = ""
    subtitle: str = ""
    date: str = ""
    description: str = ""
    bullets: list[str] = Field(default_factory=list)


class PublicationItem(Model):
    id: str = Field(default_factory=_new_id)
    title: str = ""
    publisher: str = ""
    authors: str = ""
    date: str = ""
    url: str = ""
    description: str = ""


class LanguageItem(Model):
    id: str = Field(default_factory=_new_id)
    name: str = ""
    # Text proficiency only - never a bar or percentage (unparseable by an ATS).
    proficiency: str = ""


class ReferenceItem(Model):
    id: str = Field(default_factory=_new_id)
    name: str = ""
    title: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    relationship: str = ""


# --- Sections ---------------------------------------------------------------


class SectionBase(Model):
    id: str = Field(default_factory=_new_id)
    type: SectionType
    title: str
    visible: bool = True


class TextSection(SectionBase):
    kind: Literal["text"] = "text"
    content: str = ""


class ExperienceSection(SectionBase):
    kind: Literal["experience"] = "experience"
    items: list[ExperienceItem] = Field(default_factory=list)


class EducationSection(SectionBase):
    kind: Literal["education"] = "education"
    items: list[EducationItem] = Field(default_factory=list)


class SkillsSection(SectionBase):
    kind: Literal["skills"] = "skills"
    groups: list[SkillGroup] = Field(default_factory=list)
    # "grouped" renders "Languages: Python, TypeScript"; "inline" renders one line.
    display: Literal["grouped", "inline"] = "grouped"


class ProjectsSection(SectionBase):
    kind: Literal["projects"] = "projects"
    items: list[ProjectItem] = Field(default_factory=list)


class CertificationsSection(SectionBase):
    kind: Literal["certifications"] = "certifications"
    items: list[CertificationItem] = Field(default_factory=list)


class GenericListSection(SectionBase):
    kind: Literal["list"] = "list"
    items: list[ListItem] = Field(default_factory=list)


class PublicationsSection(SectionBase):
    kind: Literal["publications"] = "publications"
    items: list[PublicationItem] = Field(default_factory=list)


class LanguagesSection(SectionBase):
    kind: Literal["languages"] = "languages"
    items: list[LanguageItem] = Field(default_factory=list)


class TagsSection(SectionBase):
    kind: Literal["tags"] = "tags"
    tags: list[str] = Field(default_factory=list)


class ReferencesSection(SectionBase):
    kind: Literal["references"] = "references"
    items: list[ReferenceItem] = Field(default_factory=list)
    hide_details: bool = Field(False, alias="hideDetails")


Section = Annotated[
    TextSection
    | ExperienceSection
    | EducationSection
    | SkillsSection
    | ProjectsSection
    | CertificationsSection
    | GenericListSection
    | PublicationsSection
    | LanguagesSection
    | TagsSection
    | ReferencesSection,
    Field(discriminator="kind"),
]


# --- Settings ---------------------------------------------------------------

DateFormat = Literal["short-month", "long-month", "numeric", "year-only"]
PageSize = Literal["a4", "letter"]
PhotoShape = Literal["circle", "rounded", "square"]
PhotoSize = Literal["sm", "md", "lg"]


class ResumeSettings(Model):
    page_size: PageSize = Field("a4", alias="pageSize")
    font_family: str = Field("Inter", alias="fontFamily")
    font_size: float = Field(10.5, alias="fontSize", ge=8, le=14)
    heading_scale: float = Field(1.0, alias="headingScale", ge=0.8, le=1.4)
    line_height: float = Field(1.4, alias="lineHeight", ge=1.0, le=2.0)
    margin: Literal["narrow", "normal", "wide"] = "normal"
    section_spacing: float = Field(1.0, alias="sectionSpacing", ge=0.6, le=1.8)
    accent_color: str = Field("#111827", alias="accentColor")
    date_format: DateFormat = Field("short-month", alias="dateFormat")
    show_icons: bool = Field(False, alias="showIcons")
    uppercase_headings: bool = Field(True, alias="uppercaseHeadings")
    bullet_char: str = Field("•", alias="bulletChar")
    photo_shape: PhotoShape = Field("circle", alias="photoShape")
    photo_size: PhotoSize = Field("md", alias="photoSize")
    show_photo: bool = Field(True, alias="showPhoto")


class ResumeData(Model):
    version: int = 1
    personal: PersonalInfo = Field(default_factory=PersonalInfo)
    sections: list[Section] = Field(default_factory=list)

    def visible_sections(self) -> list[Section]:
        return [section for section in self.sections if section.visible]

    def section_by_type(self, section_type: str) -> Section | None:
        for section in self.sections:
            if section.type == section_type:
                return section
        return None
