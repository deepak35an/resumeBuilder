"""Resume persistence: CRUD, duplication, version snapshots and completeness."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, PlanLimitError, ValidationError_
from app.core.plans import UNLIMITED, limits_for
from app.models import Resume, ResumeVersion, User
from app.schemas.resume_data import ResumeData, ResumeSettings
from app.services.resume_defaults import ESSENTIAL_SECTIONS, blank_resume_data, default_settings
from app.services.resume_text import extract_facts

#: A new autosave snapshot is only kept if the previous one is older than this.
AUTOSAVE_SNAPSHOT_INTERVAL = timedelta(minutes=10)
#: Cap on retained versions per resume, oldest autosaves pruned first.
MAX_VERSIONS = 30


def validate_resume_data(data: dict[str, Any] | None) -> dict[str, Any]:
    """Run untrusted input through the canonical model. Rejects unknown shapes."""
    if data is None:
        return blank_resume_data()
    try:
        return ResumeData.model_validate(data).model_dump(by_alias=True)
    except Exception as exc:  # noqa: BLE001 - surfaced as a clean 422
        raise ValidationError_(
            "That resume content could not be read. Please check the section data.",
            details=[{"field": "data", "message": str(exc)[:400]}],
        ) from exc


def validate_settings(settings: dict[str, Any] | None) -> dict[str, Any]:
    if settings is None:
        return default_settings()
    try:
        return ResumeSettings.model_validate(settings).model_dump(by_alias=True)
    except Exception as exc:  # noqa: BLE001
        raise ValidationError_(
            "Those resume settings are not valid.",
            details=[{"field": "settings", "message": str(exc)[:400]}],
        ) from exc


def completeness(data: dict[str, Any]) -> int:
    """0-100 estimate of how finished a resume is. Drives the dashboard nudges."""
    facts = extract_facts(data)
    score = 0

    # Contact block (25)
    if facts.has_name:
        score += 8
    if facts.has_email:
        score += 8
    if facts.has_phone:
        score += 5
    if facts.has_location:
        score += 4

    # Summary (10)
    summary_words = len(facts.summary_text.split())
    if summary_words >= 25:
        score += 10
    elif summary_words >= 10:
        score += 6

    # Experience or, for early-career resumes, projects (30)
    if facts.experience_count > 0:
        score += 18
        if len(facts.bullets) >= facts.experience_count * 2:
            score += 12
        elif facts.bullets:
            score += 6
    elif facts.project_count > 0:
        score += 12
        if facts.bullets:
            score += 6

    # Education (15)
    if facts.education_count > 0:
        score += 15

    # Skills (15)
    if len(facts.skills) >= 8:
        score += 15
    elif len(facts.skills) >= 3:
        score += 9
    elif facts.skills:
        score += 4

    # Links (5)
    if facts.has_links:
        score += 5

    return max(0, min(100, score))


def missing_essentials(data: dict[str, Any]) -> list[str]:
    facts = extract_facts(data)
    return [section for section in ESSENTIAL_SECTIONS if section not in facts.visible_section_types]


class ResumeService:
    def __init__(self, db: Session) -> None:
        self.db = db

    # --- Queries -----------------------------------------------------------

    def list_for_user(
        self, user: User, *, include_deleted: bool = False, search: str | None = None
    ) -> list[Resume]:
        stmt = select(Resume).where(Resume.user_id == user.id)
        if not include_deleted:
            stmt = stmt.where(Resume.is_deleted.is_(False))
        if search:
            stmt = stmt.where(Resume.title.ilike(f"%{search.strip()}%"))
        return list(self.db.scalars(stmt.order_by(Resume.updated_at.desc())).all())

    def get_owned(self, user: User, resume_id: uuid.UUID, *, allow_deleted: bool = False) -> Resume:
        resume = self.db.get(Resume, resume_id)
        if resume is None or resume.user_id != user.id:
            raise NotFoundError("That resume does not exist.")
        if resume.is_deleted and not allow_deleted:
            raise NotFoundError("That resume has been deleted.")
        return resume

    def active_count(self, user: User) -> int:
        stmt = select(func.count(Resume.id)).where(
            Resume.user_id == user.id, Resume.is_deleted.is_(False)
        )
        return int(self.db.execute(stmt).scalar_one())

    def version_count(self, resume_id: uuid.UUID) -> int:
        stmt = select(func.count(ResumeVersion.id)).where(ResumeVersion.resume_id == resume_id)
        return int(self.db.execute(stmt).scalar_one())

    # --- Mutations ---------------------------------------------------------

    def enforce_resume_quota(self, user: User) -> None:
        allowance = limits_for(user.plan).max_resumes
        if allowance == UNLIMITED:
            return
        if self.active_count(user) >= allowance:
            raise PlanLimitError(
                f"The Free plan includes {allowance} resumes. "
                "Delete one, or upgrade to Pro for unlimited resumes.",
                details={"limit": allowance, "requiredPlan": "pro"},
            )

    def create(
        self,
        user: User,
        *,
        title: str,
        template_id: str = "classic-ats",
        data: dict[str, Any] | None = None,
        settings: dict[str, Any] | None = None,
        tailored_for: str | None = None,
        source_resume_id: uuid.UUID | None = None,
    ) -> Resume:
        self.enforce_resume_quota(user)
        payload = validate_resume_data(data)
        resume = Resume(
            user_id=user.id,
            title=title.strip() or "Untitled resume",
            template_id=template_id,
            data=payload,
            settings=validate_settings(settings),
            tailored_for=tailored_for,
            source_resume_id=source_resume_id,
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        self.snapshot(resume, name="Initial version", trigger="manual")
        return resume

    def update(
        self,
        resume: Resume,
        *,
        title: str | None = None,
        template_id: str | None = None,
        data: dict[str, Any] | None = None,
        settings: dict[str, Any] | None = None,
        autosave: bool = False,
    ) -> Resume:
        if title is not None:
            resume.title = title.strip() or resume.title
        if template_id is not None:
            resume.template_id = template_id
        if data is not None:
            resume.data = validate_resume_data(data)
        if settings is not None:
            resume.settings = validate_settings(settings)

        self.db.commit()
        self.db.refresh(resume)

        # Autosaves snapshot at most once per interval; explicit saves always do.
        if data is not None or settings is not None:
            if autosave:
                self._snapshot_if_stale(resume)
            else:
                self.snapshot(resume, trigger="manual")
        return resume

    def soft_delete(self, resume: Resume) -> None:
        resume.is_deleted = True
        self.db.commit()

    def restore_deleted(self, resume: Resume) -> Resume:
        resume.is_deleted = False
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def hard_delete(self, resume: Resume) -> None:
        self.db.delete(resume)
        self.db.commit()

    def duplicate(self, user: User, resume: Resume, *, title: str | None = None) -> Resume:
        self.enforce_resume_quota(user)
        copy = Resume(
            user_id=user.id,
            title=title or f"{resume.title} (copy)",
            template_id=resume.template_id,
            data=resume.data,
            settings=resume.settings,
            ats_score=resume.ats_score,
            source_resume_id=resume.id,
        )
        self.db.add(copy)
        self.db.commit()
        self.db.refresh(copy)
        self.snapshot(copy, name="Duplicated", trigger="manual")
        return copy

    def record_download(self, resume: Resume) -> None:
        resume.download_count += 1
        self.db.commit()

    # --- Versions ----------------------------------------------------------

    def snapshot(
        self, resume: Resume, *, name: str | None = None, trigger: str = "manual"
    ) -> ResumeVersion:
        number = self.version_count(resume.id) + 1
        version = ResumeVersion(
            resume_id=resume.id,
            version_name=name or f"Version {number}",
            version_number=number,
            data=resume.data,
            settings=resume.settings,
            template_id=resume.template_id,
            ats_score=resume.ats_score,
            trigger=trigger,
        )
        self.db.add(version)
        self.db.commit()
        self._prune_versions(resume.id)
        return version

    def _snapshot_if_stale(self, resume: Resume) -> None:
        latest = self.db.scalar(
            select(ResumeVersion)
            .where(ResumeVersion.resume_id == resume.id)
            .order_by(ResumeVersion.created_at.desc())
            .limit(1)
        )
        if latest is None:
            self.snapshot(resume, trigger="autosave")
            return
        created = latest.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - created >= AUTOSAVE_SNAPSHOT_INTERVAL:
            self.snapshot(resume, trigger="autosave")

    def _prune_versions(self, resume_id: uuid.UUID) -> None:
        """Keep history useful without letting it grow forever."""
        versions = list(
            self.db.scalars(
                select(ResumeVersion)
                .where(ResumeVersion.resume_id == resume_id)
                .order_by(ResumeVersion.created_at.desc())
            ).all()
        )
        if len(versions) <= MAX_VERSIONS:
            return
        # Drop the oldest autosaves first; only remove manual saves if we must.
        surplus = versions[MAX_VERSIONS:]
        surplus.sort(key=lambda version: (version.trigger != "autosave", version.created_at))
        for version in surplus:
            self.db.delete(version)
        self.db.commit()

    def list_versions(self, resume: Resume) -> list[ResumeVersion]:
        return list(
            self.db.scalars(
                select(ResumeVersion)
                .where(ResumeVersion.resume_id == resume.id)
                .order_by(ResumeVersion.created_at.desc())
            ).all()
        )

    def get_version(self, resume: Resume, version_id: uuid.UUID) -> ResumeVersion:
        version = self.db.get(ResumeVersion, version_id)
        if version is None or version.resume_id != resume.id:
            raise NotFoundError("That version does not exist.")
        return version

    def restore_version(self, resume: Resume, version: ResumeVersion) -> Resume:
        # Snapshot the current state first so a restore is never destructive.
        self.snapshot(resume, name="Before restore", trigger="restore")
        resume.data = version.data
        resume.settings = version.settings
        resume.template_id = version.template_id
        self.db.commit()
        self.db.refresh(resume)
        return resume
