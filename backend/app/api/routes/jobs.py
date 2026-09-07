from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter
from pydantic import Field
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.errors import NotFoundError, ValidationError_
from app.models import Application, JobDescription, Resume
from app.models.application import APPLICATION_STATUSES
from app.schemas.common import CamelModel, MessageResponse
from app.services.keyword_service import extract_keywords

router = APIRouter(tags=["jobs"])


class JobPayload(CamelModel):
    title: str = Field(..., min_length=1, max_length=200)
    company: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=200)
    url: str | None = Field(None, max_length=512)
    content: str = Field(..., min_length=20)


class JobUpdate(CamelModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    company: str | None = None
    location: str | None = None
    url: str | None = None
    content: str | None = Field(None, min_length=20)


class ApplicationPayload(CamelModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    company: str | None = None
    status: str = "saved"
    resume_id: uuid.UUID | None = None
    job_description_id: uuid.UUID | None = None
    ats_report_id: uuid.UUID | None = None
    notes: str | None = None
    applied_at: datetime | None = None


class ApplicationUpdate(CamelModel):
    job_title: str | None = Field(None, min_length=1, max_length=200)
    company: str | None = None
    status: str | None = None
    resume_id: uuid.UUID | None = None
    job_description_id: uuid.UUID | None = None
    ats_report_id: uuid.UUID | None = None
    notes: str | None = None
    applied_at: datetime | None = None


def _job_api(job: JobDescription) -> dict:
    return {
        "id": str(job.id),
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "url": job.url,
        "content": job.content,
        "keywordCount": len(job.extracted_keywords or []),
        "createdAt": job.created_at.isoformat(),
    }


def _app_api(db, row: Application) -> dict:
    resume_title = None
    ats_score = None
    if row.resume_id:
        resume = db.get(Resume, row.resume_id)
        if resume:
            resume_title = resume.title
            ats_score = resume.ats_score
    return {
        "id": str(row.id),
        "jobTitle": row.job_title,
        "company": row.company,
        "status": row.status,
        "resumeId": str(row.resume_id) if row.resume_id else None,
        "resumeTitle": resume_title,
        "jobDescriptionId": str(row.job_description_id) if row.job_description_id else None,
        "atsReportId": str(row.ats_report_id) if row.ats_report_id else None,
        "atsScore": ats_score,
        "matchScore": row.match_score,
        "notes": row.notes,
        "appliedAt": row.applied_at.isoformat() if row.applied_at else None,
        "createdAt": row.created_at.isoformat(),
        "updatedAt": row.updated_at.isoformat(),
    }


@router.get("/jobs")
def list_jobs(user: CurrentUser, db: DbSession):
    rows = db.scalars(
        select(JobDescription)
        .where(JobDescription.user_id == user.id)
        .order_by(JobDescription.created_at.desc())
    ).all()
    return [_job_api(job) for job in rows]


@router.post("/jobs", status_code=201)
def create_job(payload: JobPayload, user: CurrentUser, db: DbSession):
    job = JobDescription(
        user_id=user.id,
        title=payload.title,
        company=payload.company,
        location=payload.location,
        url=payload.url,
        content=payload.content,
        extracted_keywords=[k.as_dict() for k in extract_keywords(payload.content)],
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_api(job)


@router.get("/jobs/{job_id}")
def get_job(job_id: uuid.UUID, user: CurrentUser, db: DbSession):
    job = db.get(JobDescription, job_id)
    if job is None or job.user_id != user.id:
        raise NotFoundError("That job description was not found.")
    return _job_api(job)


@router.patch("/jobs/{job_id}")
def update_job(job_id: uuid.UUID, payload: JobUpdate, user: CurrentUser, db: DbSession):
    job = db.get(JobDescription, job_id)
    if job is None or job.user_id != user.id:
        raise NotFoundError("That job description was not found.")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(job, key, value)
    if payload.content:
        job.extracted_keywords = [k.as_dict() for k in extract_keywords(payload.content)]
    db.commit()
    db.refresh(job)
    return _job_api(job)


@router.delete("/jobs/{job_id}")
def delete_job(job_id: uuid.UUID, user: CurrentUser, db: DbSession):
    job = db.get(JobDescription, job_id)
    if job is None or job.user_id != user.id:
        raise NotFoundError("That job description was not found.")
    db.delete(job)
    db.commit()
    return MessageResponse(message="Job description deleted.")


@router.get("/applications")
def list_applications(user: CurrentUser, db: DbSession):
    rows = db.scalars(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.updated_at.desc())
    ).all()
    return [_app_api(db, row) for row in rows]


@router.post("/applications", status_code=201)
def create_application(payload: ApplicationPayload, user: CurrentUser, db: DbSession):
    if payload.status not in APPLICATION_STATUSES:
        raise ValidationError_("Invalid application status.")
    row = Application(
        user_id=user.id,
        job_title=payload.job_title,
        company=payload.company,
        status=payload.status,
        resume_id=payload.resume_id,
        job_description_id=payload.job_description_id,
        ats_report_id=payload.ats_report_id,
        notes=payload.notes,
        applied_at=payload.applied_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _app_api(db, row)


@router.patch("/applications/{application_id}")
def update_application(
    application_id: uuid.UUID, payload: ApplicationUpdate, user: CurrentUser, db: DbSession
):
    row = db.get(Application, application_id)
    if row is None or row.user_id != user.id:
        raise NotFoundError("That application was not found.")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in APPLICATION_STATUSES:
        raise ValidationError_("Invalid application status.")
    for key, value in data.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return _app_api(db, row)


@router.delete("/applications/{application_id}")
def delete_application(application_id: uuid.UUID, user: CurrentUser, db: DbSession):
    row = db.get(Application, application_id)
    if row is None or row.user_id != user.id:
        raise NotFoundError("That application was not found.")
    db.delete(row)
    db.commit()
    return MessageResponse(message="Application deleted.")
