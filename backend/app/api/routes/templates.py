from __future__ import annotations

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.api.deps import DbSession
from app.core.errors import NotFoundError
from app.models import Template
from app.services.template_catalog import TEMPLATES, to_api

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("")
@router.get("/", include_in_schema=False)
def list_templates(
    db: DbSession,
    category: str | None = Query(None),
    search: str | None = Query(None, max_length=80),
):
    rows = list(db.scalars(select(Template).where(Template.is_active.is_(True))).all())
    items = [to_api(row) for row in rows] if rows else [to_api(item) for item in TEMPLATES]
    if category:
        items = [item for item in items if item["category"] == category]
    if search:
        needle = search.lower()
        items = [
            item
            for item in items
            if needle in item["name"].lower()
            or needle in item["description"].lower()
            or needle in item["slug"]
        ]
    items.sort(key=lambda item: (-int(item.get("isRecommended") or 0), -int(item.get("popularity") or 0)))
    return items


@router.get("/{slug}")
def get_template(slug: str, db: DbSession):
    row = db.scalar(select(Template).where(Template.slug == slug))
    if row is not None:
        return to_api(row)
    for item in TEMPLATES:
        if item["slug"] == slug:
            return to_api(item)
    raise NotFoundError("That template does not exist.")
