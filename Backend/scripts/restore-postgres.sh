#!/bin/sh
set -eu

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <service> <user> <database> <backup.sql.gz>"
  exit 1
fi

SERVICE="$1"
USER="$2"
DATABASE="$3"
BACKUP_FILE="$4"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

gzip -dc "$BACKUP_FILE" | docker compose exec -T "$SERVICE" psql -U "$USER" "$DATABASE"
