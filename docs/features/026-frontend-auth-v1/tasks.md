# Task Checklist: Feature 026 - Frontend Auth v1

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add `frontend/src/api/http.ts` (`apiFetch` with `credentials: 'include'` + `X-XSRF-TOKEN` on mutating methods; shared `parseJson` that allows empty/204 bodies).
- [x] 2. Migrate `shifts.ts`, `products.ts`, `customers.ts`, `transactions.ts`, and `paymentApi.ts` to `apiFetch`.
- [x] 3. Add `frontend/src/api/auth.ts`: `fetchCsrf`, `login`, `logout`, `fetchMe` + `AuthUser` types matching Feature 025 DTO.
- [x] 4. Add `frontend/src/store/useAuthStore.ts`: bootstrap / login / logout; expose `storeId` helper with `DEFAULT_STORE_ID` fallback; clear shift/cart on logout.
- [x] 5. Add `LoginForm` + `AuthGate` under `frontend/src/components/auth/`; wrap `ShiftGate` inside `AuthGate` in `RegisterScreen.tsx`.
- [x] 6. Add Log out to `CashierMenu.tsx`.
- [x] 7. Thread auth `storeId` through ShiftGate hydration, OpenShift, CheckoutFooter, CheckoutModal, and CustomerSearch (prefer `/me` over hardcode).
- [x] 8. Write `docs/features/026-frontend-auth-v1/README.md`; mark Auth pending items in `docs/pending feature/frontend.md`; update `docs/README.md` catalog + Auth topic; refresh root README Auth note.

## Test Tasks

- [x] 9. Unit tests for `apiFetch` CSRF header + credentials (and 204 logout handling).
- [x] 10. `useAuthStore` tests: bootstrap success/401, login failure/success, logout clears user (+ shift/cart side effects as designed).
- [x] 11. `AuthGate` / `LoginForm` component tests: loading, login form when unauthenticated, children when authenticated, error display.
- [x] 12. Update affected tests (`ShiftGate`, customers, checkout) for auth `storeId` / mocks as needed; suite green via `npm test`.
