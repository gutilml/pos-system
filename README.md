# POS System

Modular monolith point-of-sale: Spring Boot backend, React/Vite frontend, PostgreSQL.

## Documentation hub

**Do not hunt feature folders one by one.** Start at:

**[docs/README.md](docs/README.md)** — topic index + links to every feature README (`002`–`025`), pending backlogs, and Phase A order.

Also: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) (architecture) · [docs/pending feature/](docs/pending%20feature/) (backlog).

## Prerequisites

- Docker Desktop
- Java 17+
- Node.js 20+

## Local setup

### Quick restart (Windows)

Stop stale localhost processes and start Postgres + backend + frontend cleanly:

```powershell
.\scripts\localhost-restart.ps1
```

Useful variants:

```powershell
.\scripts\localhost-restart.ps1 -StopOnly
.\scripts\localhost-restart.ps1 -StartOnly
.\scripts\localhost-restart.ps1 -ResetDb   # also re-apply schema + seed
```

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Postgres is published on host port **5433** (avoids clashing with a local Windows PostgreSQL on 5432). Backend JDBC URL matches this in `application.yml`.

### 2. Apply schema + seed demo data

Backend uses `ddl-auto: validate`, so the schema must exist before Spring Boot starts.

```bash
# Schema (first time / empty DB)
Get-Content docs\database-schema.sql | docker exec -i pos-postgres psql -U pos -d pos

# Demo store, 10 products, 2 credit customers, admin + cashier users (safe to re-run)
Get-Content docs\seed-data.sql | docker exec -i pos-postgres psql -U pos -d pos
```

Seed store id is `00000000-0000-0000-0000-000000000001` (frontend `DEFAULT_STORE_ID` fallback; live session prefers `/me.storeId`).

**Auth (Features 025–026):** API requires login. Seed users:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | ADMIN |
| `cashier` | `cashier` | CASHIER |

Flow: SPA AuthGate → `GET /api/v1/auth/csrf` → `POST /api/v1/auth/login` with `X-XSRF-TOKEN` → HttpOnly `POS_TOKEN` cookie. Logout from the cashier menu.

Existing DB: apply the new `users` table from `docs/database-schema.sql` (section 12), then re-run seed.

### 3. Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API: http://localhost:8080

Optional: set `POS_JWT_SECRET` for a non-default signing key.

Backend unit/integration tests (`cd backend`): `./mvnw test` skips JUnit 5 `@Tag("regression")`. Run regression only with `./mvnw test -Dgroups=regression -DexcludedGroups=`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173
