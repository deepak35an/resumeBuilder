from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Template
from app.services.template_catalog import TEMPLATES


def seed_templates(db: Session) -> str:
    created = 0
    updated = 0
    for index, item in enumerate(TEMPLATES):
        row = db.scalar(select(Template).where(Template.slug == item["slug"]))
        values = {
            "name": item["name"],
            "category": item["category"],
            "description": item["description"],
            "ats_rating": item["ats_rating"],
            "is_premium": item["is_premium"],
            "is_recommended": item["is_recommended"],
            "layout": item["layout"],
            "style": item["style"],
            "experience_levels": item["experience_levels"],
            "industries": item["industries"],
            "badges": item["badges"],
            "popularity": item["popularity"],
            "sort_order": index,
            "is_active": True,
        }
        if row is None:
            db.add(Template(slug=item["slug"], **values))
            created += 1
        else:
            for key, value in values.items():
                setattr(row, key, value)
            updated += 1
    db.commit()
    return f"{created} created, {updated} updated"
