from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.common import CamelModel
from app.schemas.resume_data import ResumeData, ResumeSettings


class ResumeCreate(CamelModel):
    """`data` may be supplied to start from an example, an import or a duplicate."""

    title: str = Field("Untitled resume", min_length=1, max_length=160)
    template_id: str = Field("classic-ats", max_length=64)
    data: ResumeData | None = None
    settings: ResumeSettings | None = None


class ResumeUpdate(CamelModel):
    title: str | None = Field(None, min_length=1, max_length=160)
    template_id: str | None = Field(None, max_length=64)
    data: ResumeData | None = None
    settings: ResumeSettings | None = None
    #: Autosaves snapshot less aggressively than explicit saves.
    autosave: bool = False


class ResumeDuplicate(CamelModel):
    title: str | None = Field(None, min_length=1, max_length=160)


class ResumeSummary(CamelModel):
    id: uuid.UUID
    title: str
    template_id: str
    ats_score: int | None
    download_count: int
    tailored_for: str | None
    source_resume_id: uuid.UUID | None
    version_count: int = 0
    completeness: int = 0
    created_at: datetime
    updated_at: datetime


class ResumeRead(ResumeSummary):
    data: dict[str, Any]
    settings: dict[str, Any]


class ResumeVersionSummary(CamelModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    version_name: str
    version_number: int
    template_id: str
    ats_score: int | None
    trigger: str
    created_at: datetime


class ResumeVersionRead(ResumeVersionSummary):
    data: dict[str, Any]
    settings: dict[str, Any]


class SnapshotRequest(CamelModel):
    name: str | None = Field(None, max_length=160)


class SectionDefinitionRead(CamelModel):
    type: str
    kind: str
    title: str
    description: str
    group: str
    default: bool
    repeatable: bool
    suggested_for: list[str]
