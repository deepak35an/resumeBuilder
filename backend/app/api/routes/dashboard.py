from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models import ATSReport, JobDescription, Resume, Subscription
from app.services.template_catalog import TEMPLATES

router = APIRouter(tags=["users"])


def _next_action(resume_count: int, latest: int | None, missing: int, plan: str) -> dict:
    if resume_count == 0:
        return {
            "id": "create",
            "title": "Create a resume for your target role",
            "detail": "Start with Classic ATS, then add the work you can stand behind.",
            "ctaLabel": "Create my resume",
            "ctaHref": "/resume-templates?action=create",
            "tone": "accent",
        }
    if latest is not None and latest < 75:
        return {
            "id": "improve",
            "title": "Your latest ATS score can move with a few edits",
            "detail": "Start with contact details, standard headings and stronger verbs.",
            "ctaLabel": "Review ATS health",
            "ctaHref": "/ats-resume-checker",
            "tone": "warning",
        }
    if missing:
        return {
            "id": "keywords",
            "title": f"Your last match is missing {missing} important keywords",
            "detail": "Add them only where they accurately describe your experience.",
            "ctaLabel": "Review keywords",
            "ctaHref": "/job-description-matcher",
            "tone": "warning",
        }
    if plan == "free":
        return {
            "id": "tailor",
            "title": "Create a tailored version for your next application",
            "detail": "Keep the original, then match a specific posting.",
            "ctaLabel": "Match a job",
            "ctaHref": "/job-description-matcher",
            "tone": "accent",
        }
    return {
        "id": "export",
        "title": "Your workspace looks healthy",
        "detail": "Export a text-based PDF when you are ready to apply.",
        "ctaLabel": "Open resumes",
        "ctaHref": "/resumes",
        "tone": "success",
    }


@router.get("/dashboard")
def dashboard(user: CurrentUser, db: DbSession):
    resumes = list(
        db.scalars(
            select(Resume)
            .where(Resume.user_id == user.id, Resume.is_deleted.is_(False))
            .order_by(Resume.updated_at.desc())
        ).all()
    )
    reports = list(
        db.scalars(
            select(ATSReport)
            .where(ATSReport.user_id == user.id)
            .order_by(ATSReport.created_at.desc())
            .limit(20)
        ).all()
    )
    jobs = db.scalar(
        select(func.count(JobDescription.id)).where(JobDescription.user_id == user.id)
    ) or 0
    download_count = sum(r.download_count for r in resumes)
    latest = reports[0].overall_score if reports else (resumes[0].ats_score if resumes else None)
    previous = reports[1].overall_score if len(reports) > 1 else None
    delta = (latest - previous) if latest is not None and previous is not None else None
    missing = len((reports[0].missing_keywords or [])) if reports else 0

    hour = datetime.now().hour
    greeting = "Good evening" if hour >= 17 else "Good afternoon" if hour >= 12 else "Good morning"

    counts = Counter(r.template_id for r in resumes)
    most_slug, most_count = counts.most_common(1)[0] if counts else (None, 0)
    most_name = next((t["name"] for t in TEMPLATES if t["slug"] == most_slug), most_slug)

    week = datetime.now(timezone.utc) - timedelta(days=42)
    history_rows = [
        row
        for row in reports
        if row.created_at.replace(tzinfo=timezone.utc) >= week
    ]
    history = [
        {"date": row.created_at.date().isoformat(), "score": row.overall_score}
        for row in reversed(history_rows[-12:])
    ]

    sub = db.scalar(
        select(Subscription)
        .where(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )

    from app.services.resume_service import ResumeService, completeness

    service = ResumeService(db)
    recent = [
        {
            "id": str(r.id),
            "title": r.title,
            "templateId": r.template_id,
            "atsScore": r.ats_score,
            "downloadCount": r.download_count,
            "tailoredFor": r.tailored_for,
            "sourceResumeId": str(r.source_resume_id) if r.source_resume_id else None,
            "versionCount": service.version_count(r.id),
            "completeness": completeness(r.data),
            "createdAt": r.created_at.isoformat(),
            "updatedAt": r.updated_at.isoformat(),
        }
        for r in resumes[:6]
    ]

    band = None
    if latest is not None:
        band = (
            "Excellent"
            if latest >= 90
            else "Good"
            if latest >= 75
            else "Needs Improvement"
            if latest >= 60
            else "Needs Major Improvement"
        )

    return {
        "greetingName": user.full_name.split(" ")[0] if user.full_name else "there",
        "resumeCount": len(resumes),
        "atsCheckCount": len(reports),
        "jobMatchCount": sum(1 for r in reports if r.kind == "job_match"),
        "jobDescriptionCount": int(jobs),
        "downloadCount": download_count,
        "latestScore": latest,
        "previousScore": previous,
        "scoreDelta": delta,
        "band": band,
        "topMatch": (
            {
                "jobTitle": (reports[0].summary or {}).get("jobTitle") or "Latest match",
                "company": (reports[0].summary or {}).get("company"),
                "matchScore": reports[0].match_score or reports[0].overall_score,
            }
            if reports and reports[0].kind == "job_match"
            else None
        ),
        "mostUsedTemplate": (
            {"slug": most_slug, "name": most_name or most_slug, "count": most_count}
            if most_slug
            else None
        ),
        "recentResumes": recent,
        "recentReports": [
            {
                "id": str(r.id),
                "kind": r.kind,
                "resumeId": str(r.resume_id) if r.resume_id else None,
                "resumeTitle": next((x.title for x in resumes if x.id == r.resume_id), None),
                "overallScore": r.overall_score,
                "matchScore": r.match_score,
                "createdAt": r.created_at.isoformat(),
            }
            for r in reports[:8]
        ],
        "scoreHistory": history,
        "subscription": (
            {
                "id": str(sub.id),
                "plan": sub.plan,
                "status": sub.status,
                "provider": sub.provider,
                "interval": sub.interval,
                "startDate": sub.start_date.isoformat() if sub.start_date else None,
                "endDate": sub.end_date.isoformat() if sub.end_date else None,
                "canceledAt": sub.canceled_at.isoformat() if sub.canceled_at else None,
            }
            if sub
            else None
        ),
        "nextBestAction": _next_action(len(resumes), latest, missing, user.plan),
        "greeting": greeting,
    }
