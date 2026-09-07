# ResumeForge

ATS-first resume builder, ATS checker and job-description matcher. The product loop is **Build → Check → Improve → Match → Tailor → Export → Apply**.

ATS scores are estimates. Different applicant tracking systems parse and rank resumes differently. ResumeForge never claims a file is guaranteed to pass an ATS or to get a job.

## Architecture

```
frontend/   React 18 + TypeScript + Vite + Tailwind
backend/    FastAPI + SQLAlchemy + Alembic + PostgreSQL
docker/     Production Dockerfiles and NGINX
```

The frontend and API share one `ResumeData` contract. The editor, 44 templates, ATS engine, parser and exporters all consume that model.

## Requirements

- Node.js 20+
- Python 3.11+ (3.14 is fine)
- PostgreSQL 16 (or Docker)
- Optional: Playwright/Chromium for pixel-faithful PDF export

## Local development

```bash
cp .env.example .env
docker compose up -d postgres
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
python -m app.seeds.run --all
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

Verification and password-reset links print to the console when `EMAIL_PROVIDER=console`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

Default admin (after seed): `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.example`.

## Environment variables

See [`.env.example`](.env.example). The API boots with only a database:

| Integration | Local default |
|---|---|
| Email | Console (links in logs) |
| AI | Rule-based provider if `AI_API_KEY` is empty |
| Payments | `noop` (checkout applies Pro without charging) |
| PDF | Structured text PDF if Playwright is missing |

## Database

```bash
cd backend
alembic upgrade head
python -m app.seeds.run --all
```

Seeders are idempotent: templates, blog posts and the bootstrap admin are updated in place.

## Testing

```bash
cd backend
pytest
```

```bash
cd frontend
npm test
npx tsc --noEmit -p tsconfig.app.json
```

Backend tests use in-memory SQLite and do not need Postgres.

## Docker

```bash
docker compose up --build
```

- App: http://localhost:8080
- API: http://localhost:8000

PDF with Chromium:

```bash
docker compose --profile pdf up -d
```

Production images run as non-root where practical, apply migrations on start, and expose `/health` plus `/health/ready`.

NGINX (`docker/nginx.conf`) serves the SPA, proxies `/api` to FastAPI, gzips assets and sets security headers.

## API

Prefix: `/api`

| Area | Examples |
|---|---|
| Auth | `POST /auth/register` `POST /auth/login` `POST /auth/refresh` |
| Resumes | `GET/POST /resumes` `POST /resumes/{id}/duplicate` `POST /resumes/{id}/tailor` |
| Import | `POST /resumes/import` `POST /resumes/import-text` |
| ATS | `POST /ats/analyze` `POST /ats/job-match` |
| Export | `POST /export/pdf` `POST /export/docx` |
| AI | `POST /ai/rewrite` `POST /ai/summary` `POST /ai/copilot` |
| Billing | `GET /subscriptions/pricing` `POST /subscriptions/checkout` |
| Content | `GET /content/blog` `GET /content/examples` |

## Plans

**Free:** 3 resumes, ATS-safe templates, basic ATS check, PDF export, limited job matches.

**Pro:** unlimited resumes, all templates, advanced ATS, job matching, tailored versions, AI, DOCX, version history.

With `PAYMENT_PROVIDER=noop`, checkout upgrades the account locally. Stripe and Razorpay are implemented behind environment variables.

## SEO

Public pages set title, description, canonical, Open Graph, Twitter and JSON-LD. [`frontend/public/robots.txt`](frontend/public/robots.txt) and [`frontend/public/sitemap.xml`](frontend/public/sitemap.xml) ship with the static build. Private app routes are disallowed.

## Privacy

Uploaded resumes are private. Content is not sold. Users can export or delete their data and delete their account from Settings. Source uploads are not kept after parsing.

## Product loop

Register → Classic ATS → edit with live preview → Check ATS → paste a job → match keywords → tailor a copy → download a text-based PDF → apply.
