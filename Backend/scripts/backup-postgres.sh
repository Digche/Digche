#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

backup_db() {
  service="$1"
  user="$2"
  database="$3"
  file="$BACKUP_DIR/${database}_${TIMESTAMP}.sql.gz"

  echo "Creating backup: $file"
  docker compose exec -T "$service" pg_dump -U "$user" "$database" | gzip > "$file"
}

backup_db auth-db auth_user auth_db
backup_db chat-db chat_user chat_db
backup_db ticket-db ticket_user ticket_db

echo "Postgres backups completed in $BACKUP_DIR"
