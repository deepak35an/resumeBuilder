from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from app.schemas.common import CamelModel


class UserRead(CamelModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar: str | None = None
    is_verified: bool
    is_active: bool
    plan: str
    role: str
    onboarding: dict[str, Any] = Field(default_factory=dict)
    preferences: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class UserUpdate(CamelModel):
    full_name: str | None = Field(None, max_length=160)
    avatar: str | None = Field(None, max_length=512)
    preferences: dict[str, Any] | None = None


class OnboardingRequest(CamelModel):
    target_role: str = Field(..., max_length=80)
    experience_level: Literal[
        "student", "fresher", "1-3", "3-5", "5-10", "10+"
    ]
    goal: str | None = Field(None, max_length=120)


class PlanFeatures(CamelModel):
    plan: str
    features: dict[str, bool]
    quotas: dict[str, int]
    usage: dict[str, int]


class AccountDeleteRequest(CamelModel):
    password: str
    confirmation: str = Field(..., description='Must be the literal string "DELETE"')
