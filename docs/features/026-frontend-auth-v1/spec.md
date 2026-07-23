# Specification: Feature 026 - Frontend Auth v1 (Login UI + CSRF + AuthGate)

## Objective
Wire the React SPA to Feature 025 backend auth so cashiers and admins must log in before the register. Auth v1 uses the HttpOnly JWT cookie (`POS_TOKEN`), Spring CSRF (`XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header), and `credentials: 'include'` on API calls. An AuthGate sits before ShiftGate. Authenticated user (including `storeId`) is held in client state so callers prefer `/me.storeId` over scattered `DEFAULT_STORE_ID` hardcodes where practical.

## Scope
* **Strictly Frontend:** Only `frontend/` and docs (`docs/features/026-*`, pending frontend list, `docs/README.md`, root README Auth note as needed).
* **Depends on:** Feature 025 APIs — `GET /api/v1/auth/csrf`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
* **Out of scope:**
  * Backend changes (security config, schema, seeds).
  * User management UI / user CRUD.
  * Role-gated navigation or actions (ADMIN vs CASHIER remain equal in UI).
  * Store picker / multi-org UX.
  * Shift ↔ user linking (Option C remains deferred; shift gate stays store-scoped).
  * Manager override for shift discrepancy.

## UX & Business Rules
* On cold load: bootstrap CSRF (`GET /auth/csrf`), then probe session (`GET /auth/me`).
  * Authenticated → render register flow (`AuthGate` → `ShiftGate` → register).
  * 401 / unauthenticated → full-screen **Login** (username + password); do not show ShiftGate or register.
* Login success: store returned user in client state; proceed to ShiftGate (existing open-shift hydration unchanged aside from `storeId` source).
* Logout: available from Cashier menu; call `POST /auth/logout` with CSRF; clear client user; return to Login. Clear shift/cart session state as needed so the next login starts clean.
* Roles are displayed/stored for future use but **do not** gate UI in v1.
* Prefer `user.storeId` from `/me` (or login response) for shift open/current, customer search, and transaction `storeId`. Keep `DEFAULT_STORE_ID` only as a documented last-resort fallback if `storeId` is null (should not happen for seeded users).
* Mutating requests (`POST`/`PUT`/`PATCH`/`DELETE`) must send `X-XSRF-TOKEN` from the readable `XSRF-TOKEN` cookie; all API `fetch` calls must use `credentials: 'include'`.
* No fail-open: failed session probe or login errors show Retry / inline error; register is not rendered until authenticated.
* Seed credentials for local demo remain `admin`/`admin` and `cashier`/`cashier` (document in feature README / root README).

## Acceptance Criteria
1. [ ] Unauthenticated app load shows Login only; ShiftGate and register children are not rendered.
2. [ ] Successful login (after CSRF bootstrap) sets the session cookie via the API and advances to ShiftGate with user held in client state (`id`, `username`, `role`, `storeId`, …).
3. [ ] Invalid credentials show a clear error and remain on Login; register stays blocked.
4. [ ] Logout clears the client user, calls `POST /api/v1/auth/logout` with CSRF, and returns to Login; subsequent protected API use requires login again.
5. [ ] All SPA API modules send `credentials: 'include'`; mutating calls include `X-XSRF-TOKEN` derived from the `XSRF-TOKEN` cookie (central helper preferred).
6. [ ] Shift hydration/open, customer search, and checkout transaction payloads prefer `storeId` from the authenticated user over hard-coded `DEFAULT_STORE_ID` where practical.
7. [ ] No user-management screens; no role-based hiding of register/shift actions in v1.
8. [ ] Vitest covers: auth API helpers (CSRF header + credentials), auth store bootstrap/login/logout, AuthGate branches (loading / login / children), and updated call sites that pass `storeId` from auth.
9. [ ] Pending frontend Auth items (login/logout UI + current-user context) marked done / noted; `docs/README.md` catalog + Auth topic updated for Feature 026.
