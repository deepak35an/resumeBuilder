from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from pydantic import Field

from app.api.deps import CurrentUser, DbSession, enforce_quota, record_usage
from app.core.errors import PlanLimitError, ServiceUnavailableError, ValidationError_
from app.core.plans import limits_for
from app.core.rate_limit import EXPORT_LIMIT
from app.models.usage import USAGE_DOCX, USAGE_PDF
from app.schemas.common import CamelModel
from app.services.docx_service import build_docx
from app.services.pdf_service import build_pdf
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/export", tags=["exports"])


class ExportRequest(CamelModel):
    resume_id: uuid.UUID | None = None
    data: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None
    template_id: str | None = None
    html: str | None = Field(None, max_length=5_000_000)


def _payload(db, user, body: ExportRequest) -> tuple[dict, dict]:
    if body.resume_id:
        resume = ResumeService(db).get_owned(user, body.resume_id)
        ResumeService(db).record_download(resume)
        # Prefer the editor snapshot so unsaved preview HTML stays consistent
        # with the structured payload used if Playwright is unavailable.
        return body.data or resume.data, body.settings or resume.settings
    if body.data:
        return body.data, body.settings or {}
    raise ValidationError_("Provide resumeId or data.")


@router.post("/pdf", dependencies=[Depends(EXPORT_LIMIT)])
def export_pdf(payload: ExportRequest, user: CurrentUser, db: DbSession):
    enforce_quota(db, user, USAGE_PDF, "pdf_exports_per_day")
    data, settings_doc = _payload(db, user, payload)
    try:
        pdf, filename = build_pdf(
            data,
            settings_doc,
            html_document=payload.html,
            page_size=str(settings_doc.get("pageSize") or settings_doc.get("page_size") or "a4"),
        )
    except ServiceUnavailableError:
        record_usage(db, user, USAGE_PDF)
        db.commit()
        raise
    record_usage(db, user, USAGE_PDF)
    db.commit()
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/docx", dependencies=[Depends(EXPORT_LIMIT)])
def export_docx(payload: ExportRequest, user: CurrentUser, db: DbSession):
    if not limits_for(user.plan).docx_export:
        raise PlanLimitError(
            "DOCX export is a Pro feature.",
            details={"feature": "docx_export", "requiredPlan": "pro"},
        )
    enforce_quota(db, user, USAGE_DOCX, "pdf_exports_per_day")
    data, settings_doc = _payload(db, user, payload)
    docx, filename = build_docx(
        data,
        settings_doc,
        html_document=payload.html,
        template_id=payload.template_id,
    )
    record_usage(db, user, USAGE_DOCX)
    db.commit()
    return Response(
        content=docx,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
