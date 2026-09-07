#!/bin/sh
# Wait for the database, apply migrations, seed the catalogue, then start the API.
set -e

echo "[entrypoint] waiting for the database..."
python - <<'PY'
import sys, time
from sqlalchemy import create_engine, text
from app.core.config import settings

deadline = time.time() + 60
last = None
while time.time() < deadline:
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        engine.dispose()
        print("[entrypoint] database is ready")
        sys.exit(0)
    except Exception as exc:  # noqa: BLE001
        last = exc
        time.sleep(2)
print(f"[entrypoint] database unreachable: {last}", file=sys.stderr)
sys.exit(1)
PY

echo "[entrypoint] applying migrations..."
alembic upgrade head

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "[entrypoint] seeding reference data..."
  python -m app.seeds.run --all
fi

echo "[entrypoint] starting: $*"
exec "$@"
