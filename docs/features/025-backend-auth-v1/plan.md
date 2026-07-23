# Plan: Feature 025 - Backend Auth v1 (JWT Cookie + CSRF)

## Backend Architecture

### Dependencies & configuration
* Add to `backend/pom.xml`:
  * `spring-boot-starter-security`
  * JWT library (prefer **jjwt** 0.12.x `jjwt-api` / `jjwt-impl` / `jjwt-jackson`) for sign/verify HS256.
* Extend `application.yml` (and `application-test.yml`) with:
  * `pos.security.jwt.secret` (env override; strong default only for local/test)
  * `pos.security.jwt.cookie-name` (e.g. `POS_TOKEN`)
  * `pos.security.jwt.ttl` (e.g. 8h — shift-friendly)
  * `pos.security.cors.allowed-origins` (list; default `http://localhost:5173`)
  * `pos.security.cookie.secure` (false local HTTP; true behind HTTPS/Fargate later)
  * `pos.security.cookie.same-site` (`Lax` for local SPA + Vite proxy)
* Do **not** commit production secrets; document env vars in feature README / root README Auth note.

### Schema — `docs/database-schema.sql`
New table `users` (name avoids clash with credit `customers`):

| Column | Notes |
|--------|--------|
| `id` UUID PK | |
| `username` VARCHAR(100) UNIQUE NOT NULL | login id |
| `password_hash` VARCHAR(255) NOT NULL | BCrypt |
| `role` VARCHAR(20) NOT NULL | `ADMIN` \| `CASHIER` |
| `store_id` UUID NULL REFERENCES `store_settings(id)` | single-store link for v1 |
| `is_active` BOOLEAN NOT NULL DEFAULT true | |
| `created_at` TIMESTAMPTZ | |

No FK from `shifts` to `users` (Option C deferred).

### Seed — `docs/seed-data.sql`
* Fixed user UUIDs; DELETE-then-INSERT pattern consistent with existing seed.
* Seed `admin` / `admin` with BCrypt hash (document how hash was generated).
* Optional `cashier` / `cashier` with role `CASHIER`, same demo `store_id`.
* Update root `README.md` Auth note: login now exists; seed credentials listed.

### Module package `com.pos.auth`
| Layer | Types |
|-------|--------|
| models | `User`, `Role` enum (`ADMIN`, `CASHIER`) |
| repositories | `UserRepository` — `findByUsernameIgnoreCase`, etc. |
| dtos | `LoginRequestDTO` (username, password), `UserResponseDTO` (id, username, role, storeId, storeName?, isActive) |
| services | `AuthService` (login/logout/me), `JwtService` (create/parse/validate), `PosUserDetailsService` (`UserDetailsService`) |
| security | `JwtCookieAuthenticationFilter` (read HttpOnly cookie → `SecurityContext`), cookie helpers |
| config | `SecurityConfig` (`SecurityFilterChain`), `PasswordEncoder` bean (BCrypt), CORS + CSRF wiring, `@ConfigurationProperties` for `pos.security.*` |
| controllers | `AuthController` under `/api/v1/auth` |

### REST contract
| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `GET` | `/api/v1/auth/csrf` | Public | Ensures CSRF cookie (`XSRF-TOKEN`, readable) is issued; body may be empty or `{ "csrfToken": "…" }` |
| `POST` | `/api/v1/auth/login` | Public + CSRF | Validates user; sets HttpOnly JWT cookie; returns `UserResponseDTO` |
| `POST` | `/api/v1/auth/logout` | Authenticated + CSRF (or permit + CSRF) | Clears JWT cookie; **200** |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns `UserResponseDTO` from security context / DB |

### SecurityFilterChain (behavioral)
1. CORS from allowlist + credentials.
2. CSRF enabled: `CookieCsrfTokenRepository.withHttpOnlyFalse()`; header `X-XSRF-TOKEN` (Spring default). Prefer SPA-friendly request handler (Boot 3 / Security 6 deferred CSRF — document that the SPA must send the header from the cookie).
3. Session creation policy **STATELESS**.
4. `authorizeHttpRequests`:
   * permit: `POST /api/v1/auth/login`, `GET /api/v1/auth/csrf`, `POST /api/v1/payments/webhook`
   * authenticated: any other request (including all existing product/shift/transaction/customer APIs)
5. No role hierarchy checks in v1 — `.authenticated()` is enough; roles still embedded in JWT/`UserDetails` authorities (`ROLE_ADMIN` / `ROLE_CASHIER`).
6. JWT filter runs after CSRF where appropriate; invalid/missing JWT on protected routes → 401.
7. Disable default form login / HTTP basic.

### Cookie attributes (JWT)
* `HttpOnly=true`, `Path=/`, `SameSite` from config, `Secure` from config.
* On logout: `Max-Age=0` / empty value clear.

### Existing API impact
* All current `@WebMvcTest` controllers must be updated for Spring Security (e.g. `@Import(SecurityConfig)` + `@WithMockUser`, or a shared test security config). Prefer keeping filters on for at least one integration path.
* Stripe webhook path stays public; keep raw-body signature verification as today (`PaymentController`).

### Shift / tenancy
* No changes to `Shift`, `ShiftService`, or Feature 017/007 contracts.
* `/me.storeId` is informational for the future FE; APIs continue to accept `storeId` query/body as today (single-store discipline unchanged).

## Frontend Architecture

None in Feature 025.

**Follow-up Feature 026 (note only):** Login screen; AuthGate before ShiftGate; `credentials: 'include'` / Axios `withCredentials`; read `XSRF-TOKEN` → send `X-XSRF-TOKEN` on mutating calls; call `/auth/csrf`, `/auth/login`, `/auth/logout`, `/auth/me`; prefer `storeId` from `/me` over hard-coded `DEFAULT_STORE_ID` where practical.

**Breaking window:** After 025 ships, the Vite SPA will get **401** on all live APIs until 026 (or manual cookie login via curl). Call this out in README; schedule 026 next.

## Additional Considerations
* **Vite proxy:** Dev traffic is same-origin to `:5173` with `/api` proxied — cookies can work once FE sends credentials; CORS still required for any direct `:8080` calls and for deployed split origins.
* **Fargate / HTTPS:** `Secure=true` and exact production origin allowlist via env; confirm later under pending “CORS / API versioning”.
* **Password in seed:** Precomputed BCrypt string in SQL (no plaintext in DB). Document regeneration command in README.
* **Test secret:** Fixed JWT secret in `application-test.yml` only.
* **Docs:** Feature README contract table; mark pending AuthN/AuthZ, system users, login/logout/me done when shipped; leave user CRUD / RBAC policies / multi-store / shift↔user unchecked; update `docs/README.md` topic + catalog; mention 026 under Auth topic.
