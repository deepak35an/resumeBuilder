"""Email delivery behind a small provider interface.

Without SMTP credentials the console provider logs the message (including any
verification or reset link) so local development needs no mail server.
"""

from __future__ import annotations

import logging
import smtplib
from abc import ABC, abstractmethod
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("resumeforge.email")


class EmailProvider(ABC):
    @abstractmethod
    def send(self, *, to: str, subject: str, body: str) -> None: ...


class ConsoleEmailProvider(EmailProvider):
    def send(self, *, to: str, subject: str, body: str) -> None:
        logger.info(
            "Email (console provider) to=%s subject=%s\n%s",
            to,
            subject,
            body,
            extra={"email_to": to, "email_subject": subject},
        )


class SMTPEmailProvider(EmailProvider):
    def send(self, *, to: str, subject: str, body: str) -> None:
        message = EmailMessage()
        message["From"] = settings.EMAIL_FROM
        message["To"] = to
        message["Subject"] = subject
        message.set_content(body)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
            if settings.SMTP_TLS:
                smtp.starttls()
            if settings.SMTP_USER:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)


def get_email_provider() -> EmailProvider:
    if settings.EMAIL_PROVIDER == "smtp" and settings.SMTP_HOST:
        return SMTPEmailProvider()
    return ConsoleEmailProvider()


class EmailService:
    def __init__(self, provider: EmailProvider | None = None) -> None:
        self.provider = provider or get_email_provider()

    def _send(self, to: str, subject: str, body: str) -> None:
        try:
            self.provider.send(to=to, subject=subject, body=body)
        except Exception:  # noqa: BLE001 - never fail a request because mail failed
            logger.exception("Failed to send email to %s", to)

    def send_verification(self, *, to: str, name: str, token: str) -> None:
        link = f"{settings.SITE_URL}/verify-email?token={token}"
        self._send(
            to,
            "Verify your ResumeForge email address",
            f"Hi {name or 'there'},\n\n"
            "Confirm your email address to finish setting up your ResumeForge account:\n\n"
            f"{link}\n\n"
            "This link expires in 24 hours.\n",
        )

    def send_password_reset(self, *, to: str, name: str, token: str) -> None:
        link = f"{settings.SITE_URL}/reset-password?token={token}"
        self._send(
            to,
            "Reset your ResumeForge password",
            f"Hi {name or 'there'},\n\n"
            "Use the link below to choose a new password:\n\n"
            f"{link}\n\n"
            "The link expires in 1 hour. If you did not request this, you can ignore "
            "this email and your password will stay the same.\n",
        )

    def send_welcome(self, *, to: str, name: str) -> None:
        self._send(
            to,
            "Welcome to ResumeForge",
            f"Hi {name or 'there'},\n\n"
            "Your account is ready. Start by building a resume with the Classic ATS "
            "template, then run an ATS check and match it against a job description.\n\n"
            f"{settings.SITE_URL}/dashboard\n",
        )
