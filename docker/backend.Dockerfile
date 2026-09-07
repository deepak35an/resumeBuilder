# syntax=docker/dockerfile:1
# ResumeForge API. Chromium (for selectable-text PDF export) is installed in the
# `export` stage; the default `runtime` stage stays small and falls back to
# client-side printing when the PDF engine is unavailable.
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt


FROM base AS runtime

COPY backend/ /app/
RUN sed -i 's/\r$//' /app/scripts/entrypoint.sh \
    && chmod +x /app/scripts/entrypoint.sh \
    && addgroup --system --gid 1001 forge \
    && adduser --system --uid 1001 --gid 1001 forge \
    && mkdir -p /app/storage \
    && chown -R forge:forge /app

USER forge
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -fsS http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]


# Optional image with Chromium for high-quality PDF export.
FROM base AS export

COPY backend/requirements-export.txt ./requirements-export.txt
# Liberation/DejaVu are metric-compatible with Arial, Helvetica and Times New
# Roman, so ATS templates render with the fonts they declare.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fonts-liberation fonts-dejavu-core fonts-crosextra-carlito \
    && rm -rf /var/lib/apt/lists/* \
    && pip install -r requirements-export.txt \
    && playwright install --with-deps chromium

COPY backend/ /app/
RUN sed -i 's/\r$//' /app/scripts/entrypoint.sh \
    && chmod +x /app/scripts/entrypoint.sh \
    && addgroup --system --gid 1001 forge \
    && adduser --system --uid 1001 --gid 1001 forge \
    && mkdir -p /app/storage /home/forge \
    && cp -r /root/.cache/ms-playwright /home/forge/.cache-playwright 2>/dev/null || true \
    && chown -R forge:forge /app /home/forge

ENV PLAYWRIGHT_BROWSERS_PATH=/home/forge/.cache-playwright
USER forge
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -fsS http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
