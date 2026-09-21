#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Missing $ROOT/.env. Copy .env.example and fill production values." >&2
  exit 1
fi

git fetch origin main --prune
git reset --hard origin/main

docker compose up -d --build --remove-orphans

for attempt in $(seq 1 12); do
  if docker compose exec -T backend node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    echo "Deploy succeeded."
    exit 0
  fi
  sleep 5
done

docker compose logs --tail=80 backend
exit 1
