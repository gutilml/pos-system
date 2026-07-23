# Tasks: Feature 025 - Backend Auth v1

## Backend Tasks

- [x] 1. Add `spring-boot-starter-security` + JWT dependency to `backend/pom.xml`.
- [x] 2. Append `users` table to `docs/database-schema.sql`; document apply step in feature README / root README.
- [x] 3. Create `com.pos.auth.models.User` + `Role` enum and `UserRepository`.
- [x] 4. Add `pos.security.*` properties + `@ConfigurationProperties`; wire `application.yml` / `application-test.yml`.
- [x] 5. Implement `PasswordEncoder` (BCrypt), `JwtService`, `PosUserDetailsService`, cookie helpers, `JwtCookieAuthenticationFilter`.
- [x] 6. Implement `SecurityConfig`: CORS allowlist + credentials, CSRF (`XSRF-TOKEN` / `X-XSRF-TOKEN`), stateless session, public login/csrf/webhook, authenticate everything else.
- [x] 7. Implement `AuthService` + `AuthController`: `GET /csrf`, `POST /login`, `POST /logout`, `GET /me` with DTOs.
- [x] 8. Seed `admin`/`admin` (+ optional cashier) in `docs/seed-data.sql` with fixed UUIDs and BCrypt hashes; update root README Auth note.
- [x] 9. Adapt existing `@WebMvcTest` / security-sensitive tests so the suite passes with filters enabled (mock user or test security config); keep webhook publicly callable in tests.
- [x] 10. Write `docs/features/025-backend-auth-v1/README.md` contract + architecture summary.
- [x] 11. Mark Auth v1 pending items done in `docs/pending feature/backend.md`; note Feature 026 on frontend pending login items; update `docs/README.md` catalog/topic (Auth row → 025; FE follow-up 026).

## Frontend Tasks

- None (Feature **026**).

## Test Tasks

- [x] 12. `AuthService` / `JwtService` unit tests: valid login, bad password, inactive user, token claims, logout clears cookie semantics.
- [x] 13. `AuthController` WebMvc/security tests: login sets HttpOnly cookie; `/me` 200/401; logout → 401 on `/me`; CSRF missing → 403 on login/mutating auth routes as configured.
- [x] 14. Security integration (or filter) test: unauthenticated `GET /api/v1/products` → 401; after login cookie → 200; webhook `POST` permitted without JWT.
- [x] 15. Confirm `ADMIN` and `CASHIER` seeded/fixture users both access a sample protected endpoint (equal permissions).
