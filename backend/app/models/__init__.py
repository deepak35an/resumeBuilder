"""SQLAlchemy models. Importing this package registers every table on `Base`."""

from app.models.application import APPLICATION_STATUSES, Application
from app.models.ats_report import ATSReport
from app.models.blog import BlogPost
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.subscription import Subscription
from app.models.template import Template
from app.models.usage import ErrorEvent, UsageEvent
from app.models.user import OAuthAccount, RefreshToken, User

__all__ = [
    "APPLICATION_STATUSES",
    "ATSReport",
    "Application",
    "BlogPost",
    "ErrorEvent",
    "JobDescription",
    "OAuthAccount",
    "RefreshToken",
    "Resume",
    "ResumeVersion",
    "Subscription",
    "Template",
    "UsageEvent",
    "User",
]
