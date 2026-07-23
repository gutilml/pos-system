# Feature 025 — Backend Auth v1 (JWT Cookie + CSRF)

## Status

**Done** — Spring Security + JWT HttpOnly cookie + CSRF + strict CORS.

## Behavior

* Stateless JWT in HttpOnly cookie `POS_TOKEN` (default TTL 8h).
* CSRF: readable `XSRF-TOKEN` cookie; clients send `X-XSRF-TOKEN` on mutating requests.
* CORS: allowlist from `pos.security.cors.allowed-origins` (default `http://localhost:5173`) + credentials.
* Roles `ADMIN` + `CASHIER` — equal permissions in v1 (`.authenticated()` only).
* Single store; users via seed/SQL only.
* Shift ↔ user deferred (Option C).

## APIs

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/v1/auth/csrf` | Public — issues CSRF cookie + returns `{ csrfToken }` |
| `POST` | `/api/v1/auth/login` | Public + CSRF — sets `POS_TOKEN`, returns user |
| `POST` | `/api/v1/auth/logout` | CSRF — clears `POS_TOKEN` |
| `GET` | `/api/v1/auth/me` | Authenticated — current user |

`POST /api/v1/payments/webhook` remains public (Stripe signature). All other `/api/v1/**` require JWT cookie.

## Schema / seed

* Table `users` in `docs/database-schema.sql`.
* Seed users: `admin`/`admin` (ADMIN), `cashier`/`cashier` (CASHIER).
* Apply: re-run schema DDL for `users` on existing DBs, then `docs/seed-data.sql`.

## Config

```yaml
pos.security.jwt.secret: ${POS_JWT_SECRET:...}
pos.security.jwt.cookie-name: POS_TOKEN
pos.security.jwt.ttl: PT8H
pos.security.cors.allowed-origins: [http://localhost:5173]
pos.security.cookie.secure: false   # true behind HTTPS
pos.security.cookie.same-site: Lax
```

## Follow-up

* **026** — Frontend login / CSRF helper / AuthGate (SPA gets 401 until then).
* User CRUD API + FE screen, role policies, multi-org/store — pending.
