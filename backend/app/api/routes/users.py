"""Current-user profile, plan entitlements, data export and account deletion."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import delete, select

from app.api.deps import CurrentUser, DbSession, usage_count
from app.core.errors import ValidationError_
from app.core.plans import plan_features, plan_quotas
from app.core.security import verify_password
from app.models import (
    Application,
    ATSReport,
    JobDescription,
    RefreshToken,
    Resume,
    UsageEvent,
)
from app.models.usage import (
    USAGE_AI,
    USAGE_ATS_CHECK,
    USAGE_DOCX,
    USAGE_IMPORT,
    USAGE_JOB_MATCH,
    USAGE_PDF,
)
from app.schemas.common import MessageResponse
from app.schemas.user import (
    AccountDeleteRequest,
    OnboardingRequest,
    PlanFeatures,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])

TRACKED_ACTIONS = {
    "atsChecksToday": USAGE_ATS_CHECK,
    "jobMatchesToday": USAGE_JOB_MATCH,
    "aiRequestsToday": USAGE_AI,
    "importsToday": USAGE_IMPORT,
    "pdfExportsToday": USAGE_PDF,
    "docxExportsToday": USAGE_DOCX,
}


@router.get("/me", response_model=UserRead)
def read_me(user: CurrentUser):
    return user


@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, user: CurrentUser, db: DbSession):
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.avatar is not None:
        user.avatar = payload.avatar or None
    if payload.preferences is not None:
        user.preferences = {**(user.preferences or {}), **payload.preferences}
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/onboarding", response_model=UserRead)
def save_onboarding(payload: OnboardingRequest, user: CurrentUser, db: DbSession):
    user.onboarding = {
        "targetRole": payload.target_role,
        "experienceLevel": payload.experience_level,
        "goal": payload.goal,
        "completed": True,
    }
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/entitlements", response_model=PlanFeatures)
def read_entitlements(user: CurrentUser, db: DbSession):
    resume_count = len(
        db.scalars(
            select(Resume.id).where(Resume.user_id == user.id, Resume.is_deleted.is_(False))
        ).all()
    )
    usage = {key: usage_count(db, user.id, action) for key, action in TRACKED_ACTIONS.items()}
    usage["resumes"] = resume_count

    def _camel(mapping: dict) -> dict:
        return {
            "".join(part if i == 0 else part.capitalize() for i, part in enumerate(key.split("_"))): value
            for key, value in mapping.items()
        }

    return PlanFeatures(
        plan=user.plan,
        features=_camel(plan_features(user.plan)),
        quotas=_camel(plan_quotas(user.plan)),
        usage=usage,
    )


@router.get("/me/export")
def export_my_data(user: CurrentUser, db: DbSession):
    """Full data export so users can leave with everything they created."""
    resumes = db.scalars(select(Resume).where(Resume.user_id == user.id)).all()
    jobs = db.scalars(select(JobDescription).where(JobDescription.user_id == user.id)).all()
    reports = db.scalars(select(ATSReport).where(ATSReport.user_id == user.id)).all()
    return {
        "exportedAt": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
        "account": {
            "email": user.email,
            "fullName": user.full_name,
            "plan": user.plan,
            "createdAt": user.created_at.isoformat(),
        },
        "resumes": [
            {
                "id": str(r.id),
                "title": r.title,
                "templateId": r.template_id,
                "atsScore": r.ats_score,
                "data": r.data,
                "settings": r.settings,
                "updatedAt": r.updated_at.isoformat(),
            }
            for r in resumes
        ],
        "jobDescriptions": [
            {
                "id": str(j.id),
                "title": j.title,
                "company": j.company,
                "content": j.content,
                "createdAt": j.created_at.isoformat(),
            }
            for j in jobs
        ],
        "atsReports": [
            {
                "id": str(rep.id),
                "kind": rep.kind,
                "overallScore": rep.overall_score,
                "matchScore": rep.match_score,
                "createdAt": rep.created_at.isoformat(),
            }
            for rep in reports
        ],
    }


@router.delete("/me", response_model=MessageResponse)
def delete_account(payload: AccountDeleteRequest, user: CurrentUser, db: DbSession):
    if payload.confirmation.strip().upper() != "DELETE":
        raise ValidationError_(
            'Type DELETE to confirm.',
            details=[{"field": "confirmation", "message": 'Type DELETE to confirm.'}],
        )
    if not verify_password(payload.password, user.password_hash):
        raise ValidationError_(
            "Your password is incorrect.",
            details=[{"field": "password", "message": "Incorrect password."}],
        )

    # Hard-delete everything the user owns; keep anonymised usage rows for metrics.
    db.execute(delete(RefreshToken).where(RefreshToken.user_id == user.id))
    db.execute(delete(Application).where(Application.user_id == user.id))
    db.execute(delete(ATSReport).where(ATSReport.user_id == user.id))
    db.execute(delete(JobDescription).where(JobDescription.user_id == user.id))
    db.execute(delete(Resume).where(Resume.user_id == user.id))
    db.execute(
        UsageEvent.__table__.update().where(UsageEvent.user_id == user.id).values(user_id=None)
    )
    db.delete(user)
    db.commit()
    return MessageResponse(message="Your account and resumes have been deleted.")
