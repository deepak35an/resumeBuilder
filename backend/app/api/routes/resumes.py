"""Resume CRUD, duplication, version history and JSON export/import."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import Field

from app.api.deps import CurrentUser, DbSession, enforce_quota, record_usage, require_feature
from app.core.config import settings
from app.core.rate_limit import UPLOAD_LIMIT
from app.models.usage import USAGE_IMPORT
from app.schemas.common import CamelModel
from app.core.errors import ValidationError_
from app.core.rate_limit import rate_limit
from app.models import Resume, ResumeVersion
from app.schemas.common import MessageResponse
from app.schemas.resume import (
    ResumeCreate,
    ResumeDuplicate,
    ResumeRead,
    ResumeSummary,
    ResumeUpdate,
    ResumeVersionRead,
    ResumeVersionSummary,
    SectionDefinitionRead,
    SnapshotRequest,
)
from app.services.resume_defaults import (
    blank_resume_data,
    default_settings,
    section_catalog_payload,
)
from app.services.parser_service import extract_text, parse_resume_text, validate_upload
from app.services.resume_service import ResumeService, completeness, validate_resume_data

router = APIRouter(prefix="/resumes", tags=["resumes"])


def _summary(service: ResumeService, resume: Resume) -> ResumeSummary:
    return ResumeSummary(
        id=resume.id,
        title=resume.title,
        template_id=resume.template_id,
        ats_score=resume.ats_score,
        download_count=resume.download_count,
        tailored_for=resume.tailored_for,
        source_resume_id=resume.source_resume_id,
        version_count=service.version_count(resume.id),
        completeness=completeness(resume.data),
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


def _detail(service: ResumeService, resume: Resume) -> ResumeRead:
    return ResumeRead(
        **_summary(service, resume).model_dump(),
        data=resume.data,
        settings=resume.settings,
    )


def _version_summary(version: ResumeVersion) -> ResumeVersionSummary:
    return ResumeVersionSummary.model_validate(version)


# --- Reference data ---------------------------------------------------------


@router.get(
    "/section-catalog",
    response_model=list[SectionDefinitionRead],
    summary="Every section type the editor can add",
)
def section_catalog():
    return section_catalog_payload()


@router.get("/blank", summary="An empty resume document and its default settings")
def blank_resume():
    return {"data": blank_resume_data(), "settings": default_settings()}


# --- CRUD -------------------------------------------------------------------


@router.get("", response_model=list[ResumeSummary])
@router.get("/", response_model=list[ResumeSummary], include_in_schema=False)
def list_resumes(
    user: CurrentUser,
    db: DbSession,
    search: str | None = Query(None, max_length=120),
    include_deleted: bool = Query(False),
):
    service = ResumeService(db)
    resumes = service.list_for_user(user, include_deleted=include_deleted, search=search)
    return [_summary(service, resume) for resume in resumes]


@router.post("", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ResumeRead, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_resume(payload: ResumeCreate, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    resume = service.create(
        user,
        title=payload.title,
        template_id=payload.template_id,
        data=payload.data.model_dump(by_alias=True) if payload.data else None,
        settings=payload.settings.model_dump(by_alias=True) if payload.settings else None,
    )
    return _detail(service, resume)


class ImportTextRequest(CamelModel):
    text: str = Field(..., min_length=20)


@router.post("/import", dependencies=[Depends(UPLOAD_LIMIT)])
async def import_file(user: CurrentUser, db: DbSession, file: UploadFile = File(...)):
    enforce_quota(db, user, USAGE_IMPORT, "imports_per_day")
    payload = await file.read()
    validate_upload(file.filename or "resume.pdf", file.content_type, len(payload), settings.max_upload_bytes)
    text = extract_text(file.filename or "resume.pdf", payload)
    result = parse_resume_text(text)
    record_usage(db, user, USAGE_IMPORT)
    db.commit()
    return result


@router.post("/import-text", dependencies=[Depends(UPLOAD_LIMIT)])
def import_text(payload: ImportTextRequest, user: CurrentUser, db: DbSession):
    enforce_quota(db, user, USAGE_IMPORT, "imports_per_day")
    result = parse_resume_text(payload.text)
    record_usage(db, user, USAGE_IMPORT)
    db.commit()
    return result


@router.post("/import.json", response_model=ResumeRead, status_code=201)
def import_json(payload: dict, user: CurrentUser, db: DbSession):
    """Restore a resume previously exported as JSON."""
    if not isinstance(payload, dict) or "data" not in payload:
        raise ValidationError_("That file is not a ResumeForge export.")
    service = ResumeService(db)
    resume = service.create(
        user,
        title=str(payload.get("title") or "Imported resume")[:160],
        template_id=str(payload.get("templateId") or "classic-ats")[:64],
        data=validate_resume_data(payload.get("data")),
        settings=payload.get("settings"),
    )
    return _detail(service, resume)


@router.get("/{resume_id}", response_model=ResumeRead)
def read_resume(resume_id: uuid.UUID, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    return _detail(service, service.get_owned(user, resume_id))


@router.patch("/{resume_id}", response_model=ResumeRead)
def update_resume(
    resume_id: uuid.UUID, payload: ResumeUpdate, user: CurrentUser, db: DbSession
):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    updated = service.update(
        resume,
        title=payload.title,
        template_id=payload.template_id,
        data=payload.data.model_dump(by_alias=True) if payload.data else None,
        settings=payload.settings.model_dump(by_alias=True) if payload.settings else None,
        autosave=payload.autosave,
    )
    return _detail(service, updated)


@router.delete("/{resume_id}", response_model=MessageResponse)
def delete_resume(resume_id: uuid.UUID, user: CurrentUser, db: DbSession):
    """Soft delete, so an accidental removal can be undone from the dashboard."""
    service = ResumeService(db)
    service.soft_delete(service.get_owned(user, resume_id))
    return MessageResponse(message="Resume deleted.")


@router.post("/{resume_id}/restore", response_model=ResumeRead)
def restore_resume(resume_id: uuid.UUID, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id, allow_deleted=True)
    return _detail(service, service.restore_deleted(resume))


@router.post("/{resume_id}/duplicate", response_model=ResumeRead, status_code=201)
def duplicate_resume(
    resume_id: uuid.UUID, payload: ResumeDuplicate, user: CurrentUser, db: DbSession
):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    return _detail(service, service.duplicate(user, resume, title=payload.title))


class TailorRequest(CamelModel):
    title: str = Field(..., min_length=1, max_length=160)
    job_title: str = Field("", max_length=160)
    company: str = Field("", max_length=160)


@router.post(
    "/{resume_id}/tailor",
    response_model=ResumeRead,
    status_code=201,
    dependencies=[Depends(require_feature("tailored_versions"))],
)
def tailor_resume(resume_id: uuid.UUID, payload: TailorRequest, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    copy = service.duplicate(user, resume, title=payload.title)
    label = " — ".join(part for part in (payload.job_title, payload.company) if part)
    copy.tailored_for = label or payload.title
    db.commit()
    db.refresh(copy)
    return _detail(service, copy)


# --- Versions ---------------------------------------------------------------


@router.get("/{resume_id}/versions", response_model=list[ResumeVersionSummary])
def list_versions(resume_id: uuid.UUID, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    return [_version_summary(version) for version in service.list_versions(resume)]


@router.post(
    "/{resume_id}/versions",
    response_model=ResumeVersionSummary,
    status_code=201,
    dependencies=[Depends(rate_limit(30, 300, scope="resume:snapshot"))],
)
def create_version(
    resume_id: uuid.UUID, payload: SnapshotRequest, user: CurrentUser, db: DbSession
):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    return _version_summary(service.snapshot(resume, name=payload.name, trigger="manual"))


@router.get(
    "/{resume_id}/versions/{version_id}",
    response_model=ResumeVersionRead,
    dependencies=[Depends(require_feature("version_history"))],
)
def read_version(
    resume_id: uuid.UUID, version_id: uuid.UUID, user: CurrentUser, db: DbSession
):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    return ResumeVersionRead.model_validate(service.get_version(resume, version_id))


@router.post(
    "/{resume_id}/versions/{version_id}/restore",
    response_model=ResumeRead,
    dependencies=[Depends(require_feature("version_history"))],
)
def restore_version(
    resume_id: uuid.UUID, version_id: uuid.UUID, user: CurrentUser, db: DbSession
):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    version = service.get_version(resume, version_id)
    return _detail(service, service.restore_version(resume, version))


# --- Portability ------------------------------------------------------------


@router.get("/{resume_id}/export.json", summary="Download the resume as JSON")
def export_json(resume_id: uuid.UUID, user: CurrentUser, db: DbSession):
    service = ResumeService(db)
    resume = service.get_owned(user, resume_id)
    filename = f"{resume.title.replace(' ', '_')[:60] or 'resume'}.json"
    return JSONResponse(
        content={
            "schema": "resumeforge/resume@1",
            "title": resume.title,
            "templateId": resume.template_id,
            "settings": resume.settings,
            "data": resume.data,
        },
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
