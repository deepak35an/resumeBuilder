"""Idempotent seed runner.

    python -m app.seeds.run --all
    python -m app.seeds.run --templates --blog

Every seeder can be run repeatedly: existing rows are updated, not duplicated,
so this is safe to call on every container start.
"""

from __future__ import annotations

import argparse
import logging
from collections.abc import Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User
from app.seeds.blog import seed_blog
from app.seeds.templates import seed_templates

logger = logging.getLogger("resumeforge.seed")

Seeder = Callable[[Session], str]


def seed_admin(db: Session) -> str:
    """Create the bootstrap administrator described by ADMIN_EMAIL/ADMIN_PASSWORD."""
    email = settings.ADMIN_EMAIL.strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        if existing.role != "admin":
            existing.role = "admin"
            db.commit()
            return f"promoted {email} to admin"
        return f"admin {email} already exists"

    db.add(
        User(
            email=email,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            full_name="ResumeForge Admin",
            role="admin",
            plan="pro",
            is_verified=True,
            onboarding={"completed": True},
        )
    )
    db.commit()
    return f"created admin {email}"


SEEDERS: dict[str, Seeder] = {
    "admin": seed_admin,
    "templates": seed_templates,
    "blog": seed_blog,
}


def register(name: str, seeder: Seeder) -> None:
    SEEDERS[name] = seeder


def run(names: list[str]) -> None:
    with SessionLocal() as db:
        for name in names:
            seeder = SEEDERS.get(name)
            if seeder is None:
                logger.warning("Unknown seeder: %s", name)
                continue
            result = seeder(db)
            logger.info("seed:%s %s", name, result)
            print(f"[seed] {name}: {result}")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    parser = argparse.ArgumentParser(description="Seed ResumeForge reference data")
    parser.add_argument("--all", action="store_true", help="Run every seeder")
    for name in SEEDERS:
        parser.add_argument(f"--{name}", action="store_true", help=f"Run the {name} seeder")
    args = parser.parse_args()

    selected = [name for name in SEEDERS if getattr(args, name.replace("-", "_"), False)]
    if args.all or not selected:
        selected = list(SEEDERS)

    run(selected)


if __name__ == "__main__":
    main()
