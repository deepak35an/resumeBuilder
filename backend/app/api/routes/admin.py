from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query
from pydantic import Field
from sqlalchemy import func, or_, select

from app.api.deps import AdminUser, DbSession
from app.core.errors import NotFoundError
from app.models import BlogPost, ErrorEvent, Resume, Template, UsageEvent, User
from app.models.usage import USAGE_AI, USAGE_ATS_CHECK, USAGE_DOCX, USAGE_JOB_MATCH, USAGE_PDF
from app.schemas.common import CamelModel, MessageResponse, Page
from app.services.template_catalog import to_api

router = APIRouter(prefix="/admin", tags=["admin"])


class UserPatch(CamelModel):
    plan: str | None = None
    role: str | None = None
    is_active: bool | None = None


class TemplatePatch(CamelModel):
    is_premium: bool | None = None
    is_recommended: bool | None = None
    is_active: bool | None = None
    template_config: dict | None = None


class BlogPayload(CamelModel):
    title: str = Field(..., min_length=1, max_length=240)
    slug: str = Field(..., min_length=1, max_length=240)
    excerpt: str = ""
    content: str = ""
    author: str = "ResumeForge Team"
    category: str = "Resume Advice"
    tags: list[str] = Field(default_factory=list)
    published_at: datetime | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    is_published: bool | None = True


class BlogUpdate(CamelModel):
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    content: str | None = None
    author: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    published_at: datetime | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    is_published: bool | None = None


@router.get("/stats")
def stats(_: AdminUser, db: DbSession):
    now = datetime.now(timezone.utc)
    week = now - timedelta(days=7)
    users = db.scalar(select(func.count(User.id))) or 0
    new_users = db.scalar(select(func.count(User.id)).where(User.created_at >= week)) or 0
    pro_users = db.scalar(select(func.count(User.id)).where(User.plan == "pro")) or 0
    resumes = db.scalar(select(func.count(Resume.id))) or 0
    ats = db.scalar(select(func.count(UsageEvent.id)).where(UsageEvent.action == USAGE_ATS_CHECK)) or 0
    matches = db.scalar(select(func.count(UsageEvent.id)).where(UsageEvent.action == USAGE_JOB_MATCH)) or 0
    pdf = db.scalar(select(func.count(UsageEvent.id)).where(UsageEvent.action == USAGE_PDF)) or 0
    docx = db.scalar(select(func.count(UsageEvent.id)).where(UsageEvent.action == USAGE_DOCX)) or 0
    ai = db.scalar(select(func.count(UsageEvent.id)).where(UsageEvent.action == USAGE_AI)) or 0
    active = db.scalar(select(func.count(func.distinct(Resume.user_id))).where(Resume.updated_at >= week)) or 0

    signups = []
    usage = []
    for day in range(13, -1, -1):
        start = (now - timedelta(days=day)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        signups.append(
            {
                "date": start.date().isoformat(),
                "count": db.scalar(
                    select(func.count(User.id)).where(User.created_at >= start, User.created_at < end)
                )
                or 0,
            }
        )
        usage.append(
            {
                "date": start.date().isoformat(),
                "atsChecks": db.scalar(
                    select(func.count(UsageEvent.id)).where(
                        UsageEvent.action == USAGE_ATS_CHECK,
                        UsageEvent.created_at >= start,
                        UsageEvent.created_at < end,
                    )
                )
                or 0,
                "jobMatches": db.scalar(
                    select(func.count(UsageEvent.id)).where(
                        UsageEvent.action == USAGE_JOB_MATCH,
                        UsageEvent.created_at >= start,
                        UsageEvent.created_at < end,
                    )
                )
                or 0,
                "exports": db.scalar(
                    select(func.count(UsageEvent.id)).where(
                        UsageEvent.action.in_([USAGE_PDF, USAGE_DOCX]),
                        UsageEvent.created_at >= start,
                        UsageEvent.created_at < end,
                    )
                )
                or 0,
            }
        )

    return {
        "users": users,
        "newUsersThisWeek": new_users,
        "activeUsersThisWeek": active,
        "proUsers": pro_users,
        "conversionRate": round((pro_users / users) * 100, 1) if users else 0,
        "resumes": resumes,
        "atsChecks": ats,
        "jobMatches": matches,
        "pdfDownloads": pdf,
        "docxDownloads": docx,
        "aiRequests": ai,
        "monthlyRevenueUsd": pro_users * 9,
        "signupsByDay": signups,
        "usageByDay": usage,
    }


@router.get("/users")
def list_users(
    _: AdminUser,
    db: DbSession,
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    stmt = select(User).order_by(User.created_at.desc())
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(User.email.ilike(like), User.full_name.ilike(like)))
    rows = list(db.scalars(stmt).all())
    sliced = rows[(page - 1) * page_size : page * page_size]
    items = []
    for user in sliced:
        count = db.scalar(select(func.count(Resume.id)).where(Resume.user_id == user.id)) or 0
        items.append(
            {
                "id": str(user.id),
                "email": user.email,
                "fullName": user.full_name,
                "plan": user.plan,
                "role": user.role,
                "isActive": user.is_active,
                "isVerified": user.is_verified,
                "resumeCount": count,
                "lastLoginAt": None,
                "createdAt": user.created_at.isoformat(),
            }
        )
    return Page(items=items, total=len(rows), page=page, page_size=page_size)


@router.patch("/users/{user_id}")
def patch_user(user_id: uuid.UUID, payload: UserPatch, _: AdminUser, db: DbSession):
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found.")
    if payload.plan:
        user.plan = payload.plan
    if payload.role:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return {
        "id": str(user.id),
        "email": user.email,
        "fullName": user.full_name,
        "plan": user.plan,
        "role": user.role,
        "isActive": user.is_active,
        "isVerified": user.is_verified,
        "resumeCount": 0,
        "lastLoginAt": None,
        "createdAt": user.created_at.isoformat(),
    }


@router.get("/templates")
def list_templates(_: AdminUser, db: DbSession):
    rows = list(db.scalars(select(Template).order_by(Template.sort_order)).all())
    return [to_api(row) for row in rows]


@router.patch("/templates/{template_id}")
def patch_template(template_id: uuid.UUID, payload: TemplatePatch, _: AdminUser, db: DbSession):
    row = db.get(Template, template_id)
    if row is None:
        raise NotFoundError("Template not found.")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return to_api(row)


def _blog_summary(post: BlogPost) -> dict:
    return {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "author": post.author,
        "category": post.category,
        "tags": post.tags or [],
        "readingMinutes": post.reading_minutes,
        "coverImage": post.cover_image,
        "publishedAt": post.published_at.isoformat() if post.published_at else None,
    }


@router.get("/blog")
def list_blog(_: AdminUser, db: DbSession):
    rows = db.scalars(select(BlogPost).order_by(BlogPost.updated_at.desc())).all()
    return [_blog_summary(row) for row in rows]


@router.post("/blog", status_code=201)
def create_blog(payload: BlogPayload, _: AdminUser, db: DbSession):
    post = BlogPost(
        title=payload.title,
        slug=payload.slug,
        excerpt=payload.excerpt,
        content=payload.content,
        author=payload.author,
        category=payload.category,
        tags=payload.tags,
        published_at=payload.published_at or datetime.now(timezone.utc),
        seo_title=payload.seo_title,
        seo_description=payload.seo_description,
        is_published=payload.is_published,
        reading_minutes=max(1, len(payload.content.split()) // 180),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {**_blog_summary(post), "content": post.content, "seoTitle": post.seo_title, "seoDescription": post.seo_description, "updatedAt": post.updated_at.isoformat()}


@router.patch("/blog/{post_id}")
def update_blog(post_id: uuid.UUID, payload: BlogUpdate, _: AdminUser, db: DbSession):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise NotFoundError("Post not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return {**_blog_summary(post), "content": post.content, "seoTitle": post.seo_title, "seoDescription": post.seo_description, "updatedAt": post.updated_at.isoformat()}


@router.delete("/blog/{post_id}")
def delete_blog(post_id: uuid.UUID, _: AdminUser, db: DbSession):
    post = db.get(BlogPost, post_id)
    if post is None:
        raise NotFoundError("Post not found.")
    db.delete(post)
    db.commit()
    return MessageResponse(message="Post deleted.")


@router.get("/errors")
def list_errors(
    _: AdminUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    rows = list(db.scalars(select(ErrorEvent).order_by(ErrorEvent.created_at.desc())).all())
    sliced = rows[(page - 1) * page_size : page * page_size]
    items = [
        {
            "id": str(row.id),
            "level": row.level,
            "source": row.source,
            "message": row.message,
            "path": row.path,
            "createdAt": row.created_at.isoformat(),
        }
        for row in sliced
    ]
    return Page(items=items, total=len(rows), page=page, page_size=page_size)
