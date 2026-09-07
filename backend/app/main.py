"""ResumeForge API entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.errors import register_exception_handlers
from app.core.logging import RequestContextMiddleware, configure_logging

logger = logging.getLogger("resumeforge")

DESCRIPTION = """
ResumeForge is an ATS-first resume builder, resume checker and job description matcher.

**ATS scores are estimates.** Different applicant tracking systems parse and rank
resumes differently, so the scores returned by this API are heuristics designed to
surface common problems - not a guarantee of how any specific system will behave.
"""

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # noqa: ANN001, ANN201
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        if settings.is_production:
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )
        return response


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging(debug=settings.DEBUG)
    logger.info(
        "Starting %s (%s)",
        settings.PROJECT_NAME,
        settings.ENVIRONMENT,
        extra={"environment": settings.ENVIRONMENT},
    )
    settings.storage_path.mkdir(parents=True, exist_ok=True)
    yield
    engine.dispose()


app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description=DESCRIPTION,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "auth", "description": "Registration, sign-in and token rotation."},
        {"name": "users", "description": "Profile, entitlements, data export, deletion."},
        {"name": "resumes", "description": "Resume CRUD, duplication and version history."},
        {"name": "templates", "description": "Template catalogue and discovery."},
        {"name": "ats", "description": "ATS analysis and job description matching."},
        {"name": "jobs", "description": "Saved job descriptions and application workspaces."},
        {"name": "exports", "description": "PDF and DOCX generation."},
        {"name": "ai", "description": "Writing assistance. Never invents facts."},
        {"name": "subscriptions", "description": "Plans, checkout and webhooks."},
        {"name": "content", "description": "Blog, resume examples and SEO metadata."},
        {"name": "admin", "description": "Administrative dashboards and management."},
    ],
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-Id"],
    expose_headers=["X-Request-Id", "Content-Disposition"],
    max_age=3600,
)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["health"], summary="Liveness probe")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"], summary="Readiness probe (checks the database)")
def readiness() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:  # noqa: BLE001
        logger.exception("Readiness check failed")
        return {"status": "degraded", "database": "unavailable"}
    return {"status": "ok", "database": "ok"}
