# Specification: Feature 025 - Backend Auth v1 (JWT Cookie + CSRF)

## Objective
Introduce authentication for the POS API so cashiers and admins must log in before using register endpoints. Auth v1 uses Spring Security with a JWT in an HttpOnly cookie, Spring CSRF for the React SPA (`XSRF-TOKEN` / `X-XSRF-TOKEN`), and strict CORS to the React origin. Roles `ADMIN` and `CASHIER` exist for future gating but have equal permissions in v1. Tenancy remains single-store; users are provisioned only via seed/SQL (no user CRUD API). Shift↔user linking stays deferred (Option C).

## Scope
* **Strictly Backend:** Only `backend/`, `docs/database-schema.sql`, `docs/seed-data.sql`, and feature/pending docs.
* **Module:** New modular package `com.pos.auth` (parallel to `com.pos.customers` / `com.pos.inventory`).
* **Out of scope:**
  * Frontend login UI, CSRF helper, AuthGate (Feature **026**).
  * User management CRUD API / admin user screens.
  * Role-differentiated authorization policies (ADMIN vs CASHIER).
  * Multi-org / multi-store tenancy.
  * Any change to `shifts` schema or open/current/close rules (still one OPEN shift per store).
  * Linking credit `customers` to system users.

## Business Rules & Technical Constraints
* **Users ≠ customers:** System accounts live in a new `users` table, separate from credit `customers`.
* **Roles (v1):** `ADMIN`, `CASHIER` only; once authenticated, both may call all protected APIs (no `@PreAuthorize` role splits yet). Roles are still stored and returned on `/me` for future UI/API gating.
* **Provisioning (v1):** Seed and/or SQL only. Seed at least `admin` / `admin` (BCrypt); optionally a cashier user. No `POST/PUT/DELETE /users` endpoints.
* **Token:** Stateless JWT in an **HttpOnly** cookie (no DB session table / no per-request session lookup). Claims include at least user id, username, role, and single-store id.
* **CSRF:** Spring CSRF with readable `XSRF-TOKEN` cookie; clients must send `X-XSRF-TOKEN` on state-changing requests. Provide a small public bootstrap endpoint so the SPA can obtain the CSRF cookie before login.
* **CORS:** Strict allowlist — configured React origin(s) only (e.g. `http://localhost:5173`), `allowCredentials=true`. No `*`.
* **Public endpoints:** `POST /api/v1/auth/login`, CSRF bootstrap GET, and `POST /api/v1/payments/webhook` (Stripe signature remains the trust boundary). All other `/api/v1/**` require authentication.
* **Single store (v1):** Users optionally link to the demo store (`00000000-0000-0000-0000-000000000001`). `/me` returns `storeId` (and store name if cheap) so Feature 026 can replace scattered `DEFAULT_STORE_ID` hardcodes.
* **Inactive users:** `is_active = false` cannot log in; existing JWT for a deactivated user should fail authentication on subsequent requests.
* **Logout:** Clears the JWT cookie (HttpOnly); CSRF cookie may be left or rotated per Spring defaults.
* **Schema:** Append `users` to `docs/database-schema.sql` (`ddl-auto: validate`). Update `docs/seed-data.sql` with re-runnable user seeds. Do not alter `shifts`.

## Acceptance Criteria
1. [x] Unauthenticated calls to protected `/api/v1/**` endpoints return **401** (not open as today).
2. [x] `POST /api/v1/auth/login` with valid credentials sets an HttpOnly JWT cookie and returns current-user JSON (id, username, role, storeId, …); invalid credentials return **401**.
3. [x] Inactive user login returns **401**.
4. [x] `POST /api/v1/auth/logout` clears the JWT cookie and subsequent API calls without a new login return **401**.
5. [x] `GET /api/v1/auth/me` with a valid JWT cookie returns the current user; without auth returns **401**.
6. [x] Mutating requests without a valid `X-XSRF-TOKEN` (when CSRF is enabled) are rejected (**403**); with cookie + header they succeed for authenticated users.
7. [x] CORS allows only the configured React origin(s) with credentials; other origins are rejected.
8. [x] `POST /api/v1/payments/webhook` remains reachable without JWT/CSRF (signature verification unchanged).
9. [x] Seed data includes at least `admin`/`admin` (BCrypt) linked to the demo store; optional cashier seed; re-runnable with fixed UUIDs.
10. [x] `ADMIN` and `CASHIER` can both access the same protected APIs in v1 (equal permissions).
11. [x] No user CRUD endpoints are exposed; no shift schema/API changes for user attribution.
12. [x] JUnit/Mockito (and security-aware WebMvc/integration) tests cover login success/failure, cookie issuance/clearing, `/me`, CSRF rejection, webhook permit, and inactive user.
13. [x] Pending backend Auth v1 items marked done / noted; `docs/README.md` catalog updated; Feature **026** called out as FE follow-up.
