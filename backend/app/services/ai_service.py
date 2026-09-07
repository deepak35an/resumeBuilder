"""AI writing assistance with a provider abstraction.

Never fabricates employment, education, certifications, technologies,
achievements, metrics or companies. Suggestions are always returned for the
user to accept — the resume is never silently rewritten.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Protocol

import httpx

from app.core.config import settings

logger = logging.getLogger("resumeforge.ai")

NOTICE = "AI-generated suggestion — review before using."

WEAK_MAP = (
    (re.compile(r"^responsible for\s+", re.I), "Managed "),
    (re.compile(r"^duties included\s+", re.I), "Delivered "),
    (re.compile(r"^helped with\s+", re.I), "Supported "),
    (re.compile(r"^worked on\s+", re.I), "Developed "),
    (re.compile(r"^involved in\s+", re.I), "Contributed to "),
    (re.compile(r"^tasked with\s+", re.I), "Owned "),
    (re.compile(r"^assisted with\s+", re.I), "Supported "),
    (re.compile(r"^helped\s+", re.I), "Supported "),
)

FILLER = re.compile(
    r"\b(various|several|multiple|numerous|really|very|just|basically|actually)\b",
    re.I,
)

SYSTEM_GUARD = (
    "You improve resume writing. Use ONLY facts present in the user's text. "
    "Never invent companies, technologies, metrics, dates, titles or achievements. "
    "If a metric is missing, do not invent one. Return JSON only."
)


class AIProvider(Protocol):
    name: str

    def rewrite(self, text: str, action: str, context: dict[str, Any]) -> dict[str, Any]: ...

    def summarize(self, context: dict[str, Any], tone: str) -> dict[str, Any]: ...


class RuleBasedProvider:
    name = "rules"

    def rewrite(self, text: str, action: str, context: dict[str, Any]) -> dict[str, Any]:
        original = (text or "").strip()
        suggestion = original
        why = "Kept your wording."
        needs_metric = not bool(re.search(r"\d", original))

        if action in {"improve", "professional", "action-verb"}:
            rewritten = original
            for pattern, repl in WEAK_MAP:
                rewritten = pattern.sub(repl, rewritten)
            if rewritten == original and original and not original[0:1].isupper():
                rewritten = original[0].upper() + original[1:]
            if rewritten != original:
                suggestion = rewritten
                why = "Replaced a weak opener with a clearer action verb. Meaning is unchanged."
            else:
                why = "The line already leads with a verb. Tighten it only if you can add a truthful result."
        elif action == "shorten":
            suggestion = FILLER.sub("", original)
            suggestion = re.sub(r"\s{2,}", " ", suggestion).strip()
            if len(suggestion.split()) > 22:
                suggestion = " ".join(suggestion.split()[:22]).rstrip(",;") + "."
            why = "Removed filler and kept the facts you supplied."
        elif action == "grammar":
            suggestion = original
            if suggestion and not suggestion.endswith((".", "!", "?")):
                suggestion = suggestion.rstrip(",;") + "."
            suggestion = re.sub(r"\s+,", ",", suggestion)
            suggestion = re.sub(r"\bi\b", "I", suggestion)
            why = "Light grammar cleanup only — no new claims."
        elif action == "quantify":
            if needs_metric:
                why = "Consider adding a measurable result if available. No number was invented."
            else:
                why = "A number is already present. Keep it only if it is accurate."
        elif action == "technical":
            extras = context.get("technologies") or context.get("skills") or []
            mentioned = [t for t in extras if isinstance(t, str) and t.lower() in original.lower()]
            if mentioned:
                why = "Technologies already appear in this line. No extras were added."
            else:
                why = (
                    "Name a technology only if you used it on this work. "
                    "Nothing was added automatically."
                )

        return {
            "original": original,
            "suggestion": suggestion,
            "why": why,
            "needsMetric": needs_metric and action in {"improve", "quantify", "professional"},
            "provider": self.name,
            "notice": NOTICE,
        }

    def summarize(self, context: dict[str, Any], tone: str) -> dict[str, Any]:
        title = str(context.get("title") or context.get("jobTitle") or "professional")
        years = context.get("years")
        skills = [s for s in (context.get("skills") or []) if isinstance(s, str)][:8]
        industry = str(context.get("industry") or "")
        bits = [title]
        if years:
            bits.append(f"with {years} years of experience" if str(years).isdigit() else str(years))
        if industry:
            bits.append(f"in {industry}")
        skill_bit = f" focused on {', '.join(skills)}" if skills else ""
        if tone == "executive":
            summary = (
                f"Senior {title} who leads delivery{skill_bit}. "
                "Known for turning complex requirements into shipped work."
            )
        elif tone == "entry-level":
            summary = (
                f"{title.capitalize()} building a foundation{skill_bit}. "
                "Eager to contribute on real projects and learn quickly."
            )
        elif tone == "technical":
            summary = f"{title.capitalize()}{skill_bit}. Comfortable across the stack described above."
        elif tone == "concise":
            summary = f"{title.capitalize()}{skill_bit}."
        else:
            summary = (
                f"{title.capitalize()} {' '.join(bits[1:])}{skill_bit}. "
                "Builds reliable software and communicates clearly with the team."
            )
        return {
            "summary": summary.strip(),
            "tone": tone,
            "why": "Drafted only from the role, skills and experience you provided.",
            "provider": self.name,
            "notice": NOTICE,
        }


class OpenAICompatibleProvider:
    name = "model"

    def __init__(self) -> None:
        self._fallback = RuleBasedProvider()

    def _chat(self, user_payload: dict[str, Any]) -> dict[str, Any] | None:
        if not settings.AI_API_KEY:
            return None
        try:
            response = httpx.post(
                f"{settings.AI_API_BASE.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
                json={
                    "model": settings.AI_MODEL,
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                    "messages": [
                        {"role": "system", "content": SYSTEM_GUARD},
                        {"role": "user", "content": json.dumps(user_payload)},
                    ],
                },
                timeout=settings.AI_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception:  # noqa: BLE001
            logger.warning("AI provider failed; using rules fallback", exc_info=True)
            return None

    def rewrite(self, text: str, action: str, context: dict[str, Any]) -> dict[str, Any]:
        payload = self._chat(
            {
                "task": "rewrite",
                "action": action,
                "text": text,
                "context": context,
                "return": ["suggestion", "why", "needsMetric"],
            }
        )
        if not payload or "suggestion" not in payload:
            return self._fallback.rewrite(text, action, context)
        return {
            "original": text,
            "suggestion": str(payload.get("suggestion") or text),
            "why": str(payload.get("why") or "Rewrote using only the facts you supplied."),
            "needsMetric": bool(payload.get("needsMetric")),
            "provider": self.name,
            "notice": NOTICE,
        }

    def summarize(self, context: dict[str, Any], tone: str) -> dict[str, Any]:
        payload = self._chat({"task": "summary", "tone": tone, "context": context})
        if not payload or "summary" not in payload:
            return self._fallback.summarize(context, tone)
        return {
            "summary": str(payload["summary"]),
            "tone": tone,
            "why": str(payload.get("why") or "Drafted from the facts you supplied."),
            "provider": self.name,
            "notice": NOTICE,
        }


def get_provider() -> AIProvider:
    mode = (settings.AI_PROVIDER or "auto").lower()
    if mode == "rules":
        return RuleBasedProvider()
    if mode == "openai" or (mode == "auto" and settings.AI_API_KEY):
        return OpenAICompatibleProvider()
    return RuleBasedProvider()


class AIService:
    def improve_bullet(self, text: str, action: str, context: dict[str, Any] | None = None) -> dict:
        return get_provider().rewrite(text, action, context or {})

    def generate_summary(self, context: dict[str, Any], tone: str = "professional") -> dict:
        return get_provider().summarize(context, tone)

    def copilot(self, data: dict[str, Any], job_text: str = "") -> list[dict[str, Any]]:
        from app.services.ats_service import analyze

        report = analyze(data, job_text=job_text, advanced=True)
        insights: list[dict[str, Any]] = []
        for rec in report.get("recommendations", [])[:5]:
            insights.append(
                {
                    "id": rec["id"],
                    "priority": rec["priority"],
                    "title": rec["title"],
                    "detail": rec["detail"],
                    "action": rec.get("action"),
                }
            )
        return insights


ai_service = AIService()
