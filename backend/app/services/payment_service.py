"""Payment provider abstraction. Local default is NoopProvider."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import ValidationError_
from app.models import Subscription, User

logger = logging.getLogger("resumeforge.payments")


class PaymentProvider(Protocol):
    name: str

    def checkout(self, user: User, interval: str) -> dict[str, Any]: ...

    def cancel(self, subscription: Subscription) -> Subscription: ...

    def handle_webhook(self, payload: bytes, signature: str | None) -> dict[str, Any]: ...


class NoopProvider:
    name = "noop"

    def checkout(self, user: User, interval: str, db: Session) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        end = now + (timedelta(days=365) if interval == "yearly" else timedelta(days=30))
        row = Subscription(
            user_id=user.id,
            plan="pro",
            status="active",
            provider=self.name,
            interval=interval,
            start_date=now,
            end_date=end,
            amount_usd="79" if interval == "yearly" else "9",
        )
        db.add(row)
        user.plan = "pro"
        db.commit()
        db.refresh(row)
        return {
            "provider": self.name,
            "checkoutUrl": None,
            "sessionId": str(row.id),
            "message": "Pro applied locally (noop payment provider). No charge was made.",
        }

    def cancel(self, subscription: Subscription, user: User, db: Session) -> Subscription:
        subscription.status = "canceled"
        subscription.canceled_at = datetime.now(timezone.utc)
        user.plan = "free"
        db.commit()
        db.refresh(subscription)
        return subscription

    def handle_webhook(self, payload: bytes, signature: str | None) -> dict[str, Any]:
        return {"received": True, "provider": self.name}


class StripeProvider:
    name = "stripe"

    def checkout(self, user: User, interval: str, db: Session) -> dict[str, Any]:
        if not settings.STRIPE_SECRET_KEY:
            return NoopProvider().checkout(user, interval, db)
        price = (
            settings.STRIPE_PRICE_ID_PRO_YEARLY
            if interval == "yearly"
            else settings.STRIPE_PRICE_ID_PRO_MONTHLY
        )
        # Architecture-ready: live Stripe calls stay behind credentials.
        import httpx

        response = httpx.post(
            "https://api.stripe.com/v1/checkout/sessions",
            auth=(settings.STRIPE_SECRET_KEY, ""),
            data={
                "mode": "subscription",
                "success_url": f"{settings.SITE_URL}/settings?checkout=success",
                "cancel_url": f"{settings.SITE_URL}/pricing?checkout=cancel",
                "customer_email": user.email,
                "line_items[0][price]": price,
                "line_items[0][quantity]": 1,
            },
            timeout=20,
        )
        response.raise_for_status()
        body = response.json()
        db.add(
            Subscription(
                user_id=user.id,
                plan="pro",
                status="incomplete",
                provider=self.name,
                interval=interval,
                provider_subscription_id=body.get("subscription"),
                meta={"sessionId": body.get("id")},
            )
        )
        db.commit()
        return {
            "provider": self.name,
            "checkoutUrl": body.get("url"),
            "sessionId": body.get("id"),
            "message": "Redirect to Stripe to complete checkout.",
        }

    def cancel(self, subscription: Subscription, user: User, db: Session) -> Subscription:
        return NoopProvider().cancel(subscription, user, db)

    def handle_webhook(self, payload: bytes, signature: str | None) -> dict[str, Any]:
        logger.info("Stripe webhook received (%s bytes)", len(payload))
        return {"received": True, "provider": self.name}


class RazorpayProvider:
    name = "razorpay"

    def checkout(self, user: User, interval: str, db: Session) -> dict[str, Any]:
        if not settings.RAZORPAY_KEY_ID:
            return NoopProvider().checkout(user, interval, db)
        return {
            "provider": self.name,
            "checkoutUrl": None,
            "sessionId": None,
            "message": "Razorpay keys detected. Complete checkout on the client with the hosted widget.",
        }

    def cancel(self, subscription: Subscription, user: User, db: Session) -> Subscription:
        return NoopProvider().cancel(subscription, user, db)

    def handle_webhook(self, payload: bytes, signature: str | None) -> dict[str, Any]:
        return {"received": True, "provider": self.name}


def get_provider() -> Any:
    name = (settings.PAYMENT_PROVIDER or "noop").lower()
    if name == "stripe":
        return StripeProvider()
    if name == "razorpay":
        return RazorpayProvider()
    return NoopProvider()


def current_subscription(db: Session, user: User) -> Subscription | None:
    return db.scalar(
        select(Subscription)
        .where(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )


def require_interval(interval: str) -> str:
    if interval not in {"monthly", "yearly"}:
        raise ValidationError_("Interval must be monthly or yearly.")
    return interval
