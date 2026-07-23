# Feature 026 — Frontend Auth v1 (Login UI + CSRF + AuthGate)

## Status

**Done**

## Behavior

* Bootstrap: `GET /auth/csrf` → `GET /auth/me`; unauthenticated → Login; authenticated → register.
* Login / logout against Feature 025; HttpOnly JWT cookie set by backend.
* All API calls: `credentials: 'include'`; mutating calls send `X-XSRF-TOKEN` from `XSRF-TOKEN` cookie.
* **AuthGate** wraps **ShiftGate** (auth before shift).
* Prefer `storeId` from `/me` over `DEFAULT_STORE_ID` where practical (`selectStoreId` fallback).
* Roles stored but not used to gate UI in v1.
* Logout clears auth session plus local shift/cart state.

## Depends on

Feature 025 — `csrf` / `login` / `logout` / `me`.

## Out of scope

User management UI, role-gated screens, store picker, shift ↔ user linking.
