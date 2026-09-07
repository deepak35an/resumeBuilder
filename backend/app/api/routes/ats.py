from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import Field
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession, OptionalUser, enforce_quota, record_usage
from app.core.errors import NotFoundError, ValidationError_
from app.core.plans import limits_for
from app.core.rate_limit import ANALYSIS_LIMIT
from app.models import ATSReport, JobDescription, Resume
from app.models.usage import USAGE_ATS_CHECK, USAGE_JOB_MATCH
from app.schemas.common import CamelModel, Page
from app.services.ats_service import analyze, persist_report
from app.services.keyword_service import extract_keywords
from app.services.parser_service import parse_resume_text
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/ats", tags=["ats"])


class AnalyzeRequest(CamelModel):
    resume_id: uuid.UUID | None = None
    data: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None
    template_id: str | None = None
    text: str | None = None
    job_title: str | None = None
    company: str | None = None
    job_description: str | None = None


class JobMatchRequest(CamelModel):
    resume_id: uuid.UUID | None = None
    data: dict[str, Any] | None = None
    job_description_id: uuid.UUID | None = None
    job_title: str = ""
    company: str | None = None
    job_description: str = Field(..., min_length=20)


def _load_resume_payload(
    db, user, resume_id: uuid.UUID | None, data: dict | None, settings: dict | None, template_id: str | None, text: str | None
) -> tuple[dict, dict, str, uuid.UUID | None]:
    if resume_id and user:
        resume = ResumeService(db).get_owned(user, resume_id)
        return resume.data, resume.settings, resume.template_id, resume.id
    if data:
        return data, settings or {}, template_id or "classic-ats", resume_id
    if text:
        parsed = parse_resume_text(text)
        return parsed["data"], settings or {}, template_id or "classic-ats", resume_id
    raise ValidationError_("Provide a resume, pasted text, or a saved resume id.")


@router.post("/analyze", dependencies=[Depends(ANALYSIS_LIMIT)])
def analyze_resume(payload: AnalyzeRequest, db: DbSession, user: OptionalUser):
    if user:
        enforce_quota(db, user, USAGE_ATS_CHECK, "ats_checks_per_day")
    data, settings, template_id, resume_id = _load_resume_payload(
        db, user, payload.resume_id, payload.data, payload.settings, payload.template_id, payload.text
    )
    advanced = bool(user and limits_for(user.plan).advanced_ats)
    report = analyze(
        data,
        settings=settings,
        template_id=template_id,
        job_text=payload.job_description or "",
        job_title=payload.job_title or "",
        company=payload.company or "",
        advanced=advanced or user is None,
    )
    persist_report(
        db,
        report,
        user_id=user.id if user else None,
        resume_id=resume_id,
        source="upload" if payload.text else "builder",
    )
    record_usage(db, user, USAGE_ATS_CHECK, resumeId=str(resume_id) if resume_id else None)
    db.commit()
    return report


@router.post("/job-match", dependencies=[Depends(ANALYSIS_LIMIT)])
def job_match(payload: JobMatchRequest, db: DbSession, user: CurrentUser):
    enforce_quota(db, user, USAGE_JOB_MATCH, "job_matches_per_day")
    data, settings, template_id, resume_id = _load_resume_payload(
        db, user, payload.resume_id, payload.data, None, None, None
    )
    job_id = payload.job_description_id
    content = payload.job_description
    title = payload.job_title
    company = payload.company
    if job_id:
        job = db.get(JobDescription, job_id)
        if job is None or job.user_id != user.id:
            raise NotFoundError("That job description was not found.")
        content = job.content
        title = title or job.title
        company = company or job.company
    else:
        job = JobDescription(
            user_id=user.id,
            title=title or "Untitled role",
            company=company,
            content=content,
            extracted_keywords=[k.as_dict() for k in extract_keywords(content)],
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id

    report = analyze(
        data,
        settings=settings,
        template_id=template_id,
        job_text=content,
        job_title=title or "",
        company=company or "",
        advanced=limits_for(user.plan).advanced_ats,
    )
    persist_report(
        db,
        report,
        user_id=user.id,
        resume_id=resume_id,
        job_description_id=job_id,
        source="matcher",
    )
    record_usage(db, user, USAGE_JOB_MATCH)
    db.commit()
    return report


def _report_to_api(row: ATSReport) -> dict[str, Any]:
    summary = row.summary or {}
    return {
        "id": str(row.id),
        "kind": row.kind,
        "overallScore": row.overall_score,
        "matchScore": row.match_score,
        "band": summary.get("band") or "good",
        "bandLabel": (summary.get("band") or "good").replace("-", " ").title(),
        "headline": summary.get("headline") or "",
        "breakdown": [],
        "issues": row.issues or [],
        "strengths": row.strengths or [],
        "recommendations": row.recommendations or [],
        "matchedKeywords": row.matched_keywords or [],
        "missingKeywords": row.missing_keywords or [],
        "relatedKeywords": [],
        "sections": row.sections or [],
        "completeness": [],
        "wordCount": summary.get("wordCount") or 0,
        "estimatedPages": 1,
        "disclaimer": "ATS scores are estimates. Different applicant tracking systems use different parsing and ranking methods.",
        "createdAt": row.created_at.isoformat(),
        "jobTitle": summary.get("jobTitle"),
        "company": summary.get("company"),
        "jobDescriptionId": str(row.job_description_id) if row.job_description_id else None,
    }


@router.get("/reports")
def list_reports(
    user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    stmt = (
        select(ATSReport)
        .where(ATSReport.user_id == user.id)
        .order_by(ATSReport.created_at.desc())
    )
    rows = list(db.scalars(stmt).all())
    total = len(rows)
    sliced = rows[(page - 1) * page_size : page * page_size]
    return Page(items=[_report_to_api(row) for row in sliced], total=total, page=page, page_size=page_size)


@router.get("/reports/{report_id}")
def get_report(report_id: uuid.UUID, user: CurrentUser, db: DbSession):
    row = db.get(ATSReport, report_id)
    if row is None or row.user_id != user.id:
        raise NotFoundError("That report was not found.")
    return _report_to_api(row)
