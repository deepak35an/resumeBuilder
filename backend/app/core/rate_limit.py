"""In-process fixed-window rate limiting.

Deliberately dependency-free: a single API container needs no Redis, and the
limiter is exposed as a FastAPI dependency so it composes with plan quotas.
For multi-replica deployments swap `_WindowStore` for a shared backend.
"""

from __future__ import annotations

import threading
import time
from collections.abc import Callable

from fastapi import Request

from app.core.errors import RateLimitError


class _WindowStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._hits: dict[str, list[float]] = {}
        self._last_sweep = time.monotonic()

    def hit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = time.monotonic()
        with self._lock:
            if now - self._last_sweep > 300:
                self._sweep(now)
            timestamps = [ts for ts in self._hits.get(key, []) if now - ts < window_seconds]
            if len(timestamps) >= limit:
                retry_after = int(window_seconds - (now - timestamps[0])) + 1
                self._hits[key] = timestamps
                return False, retry_after
            timestamps.append(now)
            self._hits[key] = timestamps
            return True, 0

    def _sweep(self, now: float) -> None:
        for key, timestamps in list(self._hits.items()):
            kept = [ts for ts in timestamps if now - ts < 3600]
            if kept:
                self._hits[key] = kept
            else:
                del self._hits[key]
        self._last_sweep = now

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


store = _WindowStore()


def _identity(request: Request) -> str:
    """Prefer the bearer token subject, fall back to the client address."""
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return f"token:{hash(auth[7:]) & 0xFFFFFFFF}"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return f"ip:{forwarded.split(',')[0].strip()}"
    return f"ip:{request.client.host if request.client else 'unknown'}"


def rate_limit(
    limit: int, window_seconds: int = 60, *, scope: str | None = None
) -> Callable[[Request], None]:
    """Dependency factory: `Depends(rate_limit(10, 60))`."""

    def _dependency(request: Request) -> None:
        bucket = scope or request.scope.get("route").path  # type: ignore[union-attr]
        allowed, retry_after = store.hit(f"{bucket}:{_identity(request)}", limit, window_seconds)
        if not allowed:
            raise RateLimitError(
                "Too many requests. Please wait a moment and try again.",
                details={"retryAfterSeconds": retry_after},
            )

    return _dependency


# Named policies so limits live in one place.
LOGIN_LIMIT = rate_limit(10, 300, scope="auth:login")
REGISTER_LIMIT = rate_limit(5, 3600, scope="auth:register")
PASSWORD_RESET_LIMIT = rate_limit(5, 3600, scope="auth:reset")
ANALYSIS_LIMIT = rate_limit(20, 300, scope="analysis")
AI_LIMIT = rate_limit(30, 300, scope="ai")
EXPORT_LIMIT = rate_limit(30, 300, scope="export")
UPLOAD_LIMIT = rate_limit(15, 600, scope="upload")
CONTACT_LIMIT = rate_limit(5, 3600, scope="contact")
