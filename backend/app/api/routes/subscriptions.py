from __future__ import annotations

from fastapi import APIRouter, Request

from app.api.deps import CurrentUser, DbSession
from app.core.errors import NotFoundError
from app.core.plans import PLANS, plan_features, plan_quotas
from app.schemas.common import CamelModel, MessageResponse
from app.services.payment_service import (
    current_subscription,
    get_provider,
    require_interval,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


class CheckoutRequest(CamelModel):
    plan: str = "pro"
    interval: str = "monthly"


def _camel_keys(mapping: dict) -> dict:
    return {
        "".join(part if i == 0 else part.capitalize() for i, part in enumerate(key.split("_"))): value
        for key, value in mapping.items()
    }


@router.get("/pricing")
def pricing():
    return [
        {
            "key": plan.key,
            "name": plan.name,
            "priceMonthlyUsd": plan.price_monthly_usd,
            "priceYearlyUsd": plan.price_yearly_usd,
            "highlights": plan.highlights,
            "features": _camel_keys(plan_features(plan.key)),
            "quotas": _camel_keys(plan_quotas(plan.key)),
        }
        for plan in PLANS.values()
    ]


@router.get("/me")
def my_subscription(user: CurrentUser, db: DbSession):
    row = current_subscription(db, user)
    if row is None:
        raise NotFoundError("No subscription on file.")
    return {
        "id": str(row.id),
        "plan": row.plan,
        "status": row.status,
        "provider": row.provider,
        "interval": row.interval,
        "startDate": row.start_date.isoformat() if row.start_date else None,
        "endDate": row.end_date.isoformat() if row.end_date else None,
        "canceledAt": row.canceled_at.isoformat() if row.canceled_at else None,
    }


@router.post("/checkout")
def checkout(payload: CheckoutRequest, user: CurrentUser, db: DbSession):
    interval = require_interval(payload.interval)
    return get_provider().checkout(user, interval, db)


@router.post("/cancel")
def cancel(user: CurrentUser, db: DbSession):
    row = current_subscription(db, user)
    if row is None:
        raise NotFoundError("No subscription to cancel.")
    get_provider().cancel(row, user, db)
    return MessageResponse(message="Your subscription has been canceled. You are back on the Free plan.")


@router.post("/webhook/{provider}")
async def webhook(provider: str, request: Request):
    payload = await request.body()
    signature = request.headers.get("stripe-signature") or request.headers.get("x-razorpay-signature")
    return get_provider().handle_webhook(payload, signature)
