# Digche Backend Production Notes

Core service files are not part of this Node.js production compose.

## Local

Use the normal compose command. Docker Compose will also load
`docker-compose.override.yml`, so local service and database ports are exposed.

```bash
docker compose up -d --build
```

## Production

Do not use `docker-compose.override.yml` on the server.

1. Copy root compose environment values:

```bash
cp .env.production.example .env
```

2. Copy each service production example:

```bash
cp services/auth/.env.production.example services/auth/.env
cp services/chat/.env.production.example services/chat/.env
cp services/media/.env.production.example services/media/.env
cp services/ticket/.env.production.example services/ticket/.env
```

3. Replace every placeholder value.

Important:

- `JWT_SECRET` must be identical in auth, chat, media, and ticket.
- `AUTH_INTERNAL_API_KEY` must be identical in auth, chat, media, and ticket.
- `AUTH_DB_PASSWORD`, `CHAT_DB_PASSWORD`, and `TICKET_DB_PASSWORD` in root `.env`
  must match the matching service `DB_PASSWORD` values.
- `OTP_PROVIDER=dev` is rejected in production.
- `ENABLE_SWAGGER=false` is recommended in production.

4. Start production compose:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

The gateway is bound to `127.0.0.1:8080` in production. Put host nginx/SSL in
front of it and proxy `api.your-domain` to `http://127.0.0.1:8080`.

## Backup

Create Postgres backups:

```bash
./scripts/backup-postgres.sh
```

Restore one backup:

```bash
./scripts/restore-postgres.sh auth-db auth_user auth_db backups/postgres/auth_db_YYYYMMDDTHHMMSSZ.sql.gz
```

For production, run backups from cron and sync the output to Object Storage.

## Remaining CI Step

Package lock files are not included in this archive. Generate and commit them
before enabling CI/CD:

```bash
cd services/auth && npm install
cd ../chat && npm install
cd ../media && npm install
cd ../ticket && npm install
```

After lock files exist, update Dockerfiles from `npm install --omit=dev` to
`npm ci --omit=dev`.
