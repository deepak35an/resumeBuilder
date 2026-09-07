# ResumeForge architecture

## Career OS loop

Build → Check → Improve → Match → Tailor → Export → Apply

## Shared document

`ResumeData` is defined in `backend/app/schemas/resume_data.py` and mirrored in `frontend/src/types/resume.ts`. Every feature reads that shape.

## Backend layers

- `api/routes` — HTTP, auth, quotas
- `services` — ATS, keywords, AI, parse, export, payments
- `models` — SQLAlchemy / PostgreSQL
- `seeds` — templates, blog, admin

## ATS scoring

Configurable weights (default): formatting 20, keywords 30, content 20, experience 15, skills 10, completeness 5.

Scores are heuristics. The disclaimer is attached to every report.

## AI

`AIService` selects `OpenAICompatibleProvider` when `AI_API_KEY` is set, otherwise `RuleBasedProvider`. Suggestions are never applied silently and never invent metrics.

## Payments

`PaymentProvider`: `NoopProvider`, `StripeProvider`, `RazorpayProvider`. Webhooks live at `POST /api/subscriptions/webhook/{provider}`.
