from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import Field

from app.api.deps import CurrentUser, DbSession, enforce_quota, record_usage
from app.core.rate_limit import AI_LIMIT
from app.models.usage import USAGE_AI
from app.schemas.common import CamelModel
from app.services.ai_service import NOTICE, ai_service
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/ai", tags=["ai"])


class RewriteRequest(CamelModel):
    text: str = Field(..., min_length=1, max_length=4000)
    action: str = "improve"
    context: str | dict[str, Any] | None = None
    resume_id: uuid.UUID | None = None


class SummaryRequest(CamelModel):
    data: dict[str, Any]
    tone: str = "professional"
    resume_id: uuid.UUID | None = None


class CopilotRequest(CamelModel):
    resume_id: uuid.UUID | None = None
    data: dict[str, Any] | None = None
    job_description: str | None = None


@router.post("/rewrite", dependencies=[Depends(AI_LIMIT)])
def rewrite(payload: RewriteRequest, user: CurrentUser, db: DbSession):
    enforce_quota(db, user, USAGE_AI, "ai_requests_per_day")
    context = payload.context if isinstance(payload.context, dict) else {"note": payload.context}
    result = ai_service.improve_bullet(payload.text, payload.action, context)
    record_usage(db, user, USAGE_AI, kind=payload.action)
    db.commit()
    return result


@router.post("/summary", dependencies=[Depends(AI_LIMIT)])
def summary(payload: SummaryRequest, user: CurrentUser, db: DbSession):
    enforce_quota(db, user, USAGE_AI, "ai_requests_per_day")
    personal = (payload.data or {}).get("personal") or {}
    skills: list[str] = []
    for section in payload.data.get("sections") or []:
        if section.get("kind") == "skills":
            for group in section.get("groups") or []:
                skills.extend(group.get("skills") or [])
    result = ai_service.generate_summary(
        {
            "title": personal.get("title"),
            "jobTitle": personal.get("title"),
            "skills": skills,
        },
        payload.tone,
    )
    record_usage(db, user, USAGE_AI, kind="summary")
    db.commit()
    return result


@router.post("/copilot", dependencies=[Depends(AI_LIMIT)])
def copilot(payload: CopilotRequest, user: CurrentUser, db: DbSession):
    enforce_quota(db, user, USAGE_AI, "ai_requests_per_day")
    data = payload.data
    if payload.resume_id and not data:
        data = ResumeService(db).get_owned(user, payload.resume_id).data
    insights = ai_service.copilot(data or {}, payload.job_description or "")
    record_usage(db, user, USAGE_AI, kind="copilot")
    db.commit()
    return {"insights": insights, "notice": NOTICE}
