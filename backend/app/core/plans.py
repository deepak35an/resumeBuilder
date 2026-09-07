"""Plan definitions and the single source of truth for feature gating.

Both the API and the pricing page read from this module so the UI can never
advertise a limit the backend does not enforce.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Plan = Literal["free", "pro"]

UNLIMITED = -1


@dataclass(frozen=True)
class PlanLimits:
    key: Plan
    name: str
    price_monthly_usd: float
    price_yearly_usd: float
    max_resumes: int
    ats_checks_per_day: int
    job_matches_per_day: int
    ai_requests_per_day: int
    imports_per_day: int
    pdf_exports_per_day: int
    premium_templates: bool
    docx_export: bool
    version_history: bool
    advanced_ats: bool
    job_matcher: bool
    ai_features: bool
    tailored_versions: bool
    highlights: list[str] = field(default_factory=list)


FREE = PlanLimits(
    key="free",
    name="Free",
    price_monthly_usd=0,
    price_yearly_usd=0,
    max_resumes=3,
    ats_checks_per_day=5,
    job_matches_per_day=2,
    ai_requests_per_day=10,
    imports_per_day=3,
    pdf_exports_per_day=10,
    premium_templates=False,
    docx_export=False,
    version_history=False,
    advanced_ats=False,
    job_matcher=True,
    ai_features=True,
    tailored_versions=False,
    highlights=[
        "Up to 3 resumes",
        "All ATS-safe free templates",
        "ATS check with score breakdown",
        "PDF export with selectable text",
        "Job description matcher (2 per day)",
    ],
)

PRO = PlanLimits(
    key="pro",
    name="Pro",
    price_monthly_usd=9.0,
    price_yearly_usd=79.0,
    max_resumes=UNLIMITED,
    ats_checks_per_day=UNLIMITED,
    job_matches_per_day=UNLIMITED,
    ai_requests_per_day=300,
    imports_per_day=50,
    pdf_exports_per_day=UNLIMITED,
    premium_templates=True,
    docx_export=True,
    version_history=True,
    advanced_ats=True,
    job_matcher=True,
    ai_features=True,
    tailored_versions=True,
    highlights=[
        "Unlimited resumes and versions",
        "Every template, including premium layouts",
        "Advanced ATS analysis with prioritised fixes",
        "Unlimited job description matching",
        "Tailored resume versions per application",
        "DOCX export and full version history",
    ],
)

PLANS: dict[str, PlanLimits] = {"free": FREE, "pro": PRO}


def limits_for(plan: str | None) -> PlanLimits:
    return PLANS.get((plan or "free").lower(), FREE)


# Feature keys used by the gating dependency and by the frontend `usePlan` hook.
FEATURE_FLAGS = (
    "premium_templates",
    "docx_export",
    "version_history",
    "advanced_ats",
    "job_matcher",
    "ai_features",
    "tailored_versions",
)


def plan_features(plan: str | None) -> dict[str, bool]:
    limits = limits_for(plan)
    return {flag: bool(getattr(limits, flag)) for flag in FEATURE_FLAGS}


def plan_quotas(plan: str | None) -> dict[str, int]:
    limits = limits_for(plan)
    return {
        "max_resumes": limits.max_resumes,
        "ats_checks_per_day": limits.ats_checks_per_day,
        "job_matches_per_day": limits.job_matches_per_day,
        "ai_requests_per_day": limits.ai_requests_per_day,
        "imports_per_day": limits.imports_per_day,
        "pdf_exports_per_day": limits.pdf_exports_per_day,
    }
