from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import EmailStr, Field
from sqlalchemy import or_, select

from app.api.deps import DbSession
from app.core.errors import NotFoundError
from app.core.rate_limit import CONTACT_LIMIT
from app.models import BlogPost
from app.schemas.common import CamelModel, MessageResponse, Page
from app.services.examples import EXAMPLE_BY_SLUG, EXAMPLES

router = APIRouter(prefix="/content", tags=["content"])


class ContactRequest(CamelModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=160)
    message: str = Field(..., min_length=10, max_length=4000)


def _post_summary(post: BlogPost) -> dict:
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


def _post_detail(post: BlogPost) -> dict:
    return {
        **_post_summary(post),
        "content": post.content,
        "seoTitle": post.seo_title,
        "seoDescription": post.seo_description,
        "updatedAt": post.updated_at.isoformat(),
    }


@router.get("/blog")
def list_blog(
    db: DbSession,
    search: str | None = Query(None, max_length=80),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    stmt = select(BlogPost).where(BlogPost.is_published.is_(True)).order_by(BlogPost.published_at.desc())
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(BlogPost.title.ilike(like), BlogPost.excerpt.ilike(like)))
    rows = list(db.scalars(stmt).all())
    sliced = rows[(page - 1) * page_size : page * page_size]
    return Page(items=[_post_summary(row) for row in sliced], total=len(rows), page=page, page_size=page_size)


@router.get("/blog/{slug}")
def get_blog(slug: str, db: DbSession):
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published.is_(True)))
    if post is None:
        raise NotFoundError("That article was not found.")
    return _post_detail(post)


@router.get("/examples")
def list_examples():
    return EXAMPLES


@router.get("/examples/{slug}")
def get_example(slug: str):
    item = EXAMPLE_BY_SLUG.get(slug)
    if item is None:
        raise NotFoundError("That example page was not found.")
    return item


@router.post("/contact", dependencies=[Depends(CONTACT_LIMIT)])
def contact(payload: ContactRequest):
    return MessageResponse(
        message="Thanks — your message was received. We reply to genuine enquiries within two working days."
    )
