"""Aggregates every versioned API router under the `/api` prefix."""

from fastapi import APIRouter

from app.api.routes import (
    admin,
    ai,
    ats,
    auth,
    content,
    dashboard,
    exports,
    jobs,
    resumes,
    subscriptions,
    templates,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(resumes.router)
api_router.include_router(templates.router)
api_router.include_router(ats.router)
api_router.include_router(jobs.router)
api_router.include_router(exports.router)
api_router.include_router(ai.router)
api_router.include_router(subscriptions.router)
api_router.include_router(content.router)
api_router.include_router(admin.router)
api_router.include_router(dashboard.router)
