"""Central application configuration.

Every setting is environment driven and every optional integration has a local
default so the API boots with nothing but a database available.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Core ---------------------------------------------------------------
    PROJECT_NAME: str = "ResumeForge"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    SITE_URL: str = "http://localhost:5173"

    # --- Database -----------------------------------------------------------
    DATABASE_URL: str = "postgresql+psycopg://resumeforge:resumeforge@localhost:5432/resumeforge"

    # --- Security -----------------------------------------------------------
    JWT_SECRET: str = "insecure-development-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    # NoDecode: accept a plain comma-separated string instead of JSON.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:8080",
    ]

    # --- AI -----------------------------------------------------------------
    AI_PROVIDER: str = "auto"  # auto | rules | openai
    AI_API_KEY: str = ""
    AI_API_BASE: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o-mini"
    AI_TIMEOUT_SECONDS: float = 30.0

    # --- Email --------------------------------------------------------------
    EMAIL_PROVIDER: str = "console"  # console | smtp
    EMAIL_FROM: str = "no-reply@resumeforge.local"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True

    # --- Payments -----------------------------------------------------------
    PAYMENT_PROVIDER: str = "noop"  # noop | stripe | razorpay
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PRICE_ID_PRO_MONTHLY: str = ""
    STRIPE_PRICE_ID_PRO_YEARLY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_PLAN_ID_PRO_MONTHLY: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # --- Storage / uploads --------------------------------------------------
    STORAGE_BACKEND: str = "local"
    STORAGE_DIR: str = "./storage"
    STORAGE_BUCKET: str = ""
    MAX_UPLOAD_SIZE_MB: int = 8

    # --- Export -------------------------------------------------------------
    PDF_ENGINE: str = "playwright"

    # --- Bootstrap ----------------------------------------------------------
    ADMIN_EMAIL: str = "admin@resumeforge.local"
    ADMIN_PASSWORD: str = "ChangeMe123!"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def storage_path(self) -> Path:
        path = Path(self.STORAGE_DIR)
        if not path.is_absolute():
            path = BACKEND_DIR / path
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
