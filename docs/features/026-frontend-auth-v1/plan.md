# Plan: Feature 026 - Frontend Auth v1 (Login UI + CSRF + AuthGate)

## Backend Architecture

None. Consume Feature 025 as shipped:

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/v1/auth/csrf` | Public; issues `XSRF-TOKEN`; body `{ csrfToken }` |
| `POST` | `/api/v1/auth/login` | Public + CSRF; body `{ username, password }`; sets HttpOnly `POS_TOKEN`; returns user |
| `POST` | `/api/v1/auth/logout` | CSRF; clears JWT; **204** |
| `GET` | `/api/v1/auth/me` | Authenticated; returns user |

**User JSON (Jackson camelCase):** `id`, `username`, `role` (`ADMIN` \| `CASHIER`), `storeId`, `storeName`, `active`.

Dev: Vite proxy `/api` → `:8080` is same-origin to the SPA, so cookie + credentials work without cross-origin CORS for the happy path.

## Frontend Architecture

### 1. Shared HTTP helper — `frontend/src/api/http.ts` (new)
Today every module (`shifts.ts`, `products.ts`, `customers.ts`, `transactions.ts`, `paymentApi.ts`) duplicates `parseJson` and bare `fetch` **without** credentials or CSRF. Introduce one helper used by all:

* `apiFetch(input, init?)`:
  * Always `credentials: 'include'`.
  * For mutating methods: read `XSRF-TOKEN` from `document.cookie` and set header `X-XSRF-TOKEN` (do not overwrite if caller already set it).
  * Preserve existing `Content-Type` / body behavior.
* Optional thin `parseJson` export to collapse duplication (must allow empty/204 bodies for logout).
* Optionally treat global **401** on non-auth endpoints by signaling auth store to clear session (keep minimal if circular imports are painful).

Migrate existing API modules to `apiFetch` so open/close shift, products, customers, transactions, and Stripe-hold payment helpers all authenticate + CSRF correctly.

### 2. Auth API — `frontend/src/api/auth.ts` (new)
* Types: `AuthUser`, `LoginRequest`.
* `fetchCsrf(): Promise<string>` → `GET /api/v1/auth/csrf`.
* `login(username, password): Promise<AuthUser>` → ensure CSRF then `POST /api/v1/auth/login`.
* `logout(): Promise<void>` → ensure CSRF then `POST /api/v1/auth/logout` (accept 204).
* `fetchMe(): Promise<AuthUser>` → `GET /api/v1/auth/me`.

### 3. Auth store — `frontend/src/store/useAuthStore.ts` (new, Zustand)
Mirror `useShiftStore` patterns:

* State: `user`, `status` (`idle` \| `loading` \| `authenticated` \| `unauthenticated`), `error`.
* `bootstrap()`: `fetchCsrf` → `fetchMe`; on 401 → `unauthenticated`; on success → `authenticated` + `user`.
* `login(username, password)`: set user from response; `authenticated`.
* `logout()`: call API, clear `user`, set `unauthenticated`; also clear shift/cart as needed (`useShiftStore` reset / `useCartStore.resetAllTickets`) so the next cashier does not inherit tickets.
* Selector helper: `selectStoreId` → `user?.storeId ?? DEFAULT_STORE_ID` (fallback only).

### 4. UI — Login + AuthGate
* `components/auth/LoginForm.tsx` — username/password, submit, inline error, disabled while submitting; mobile-friendly full-viewport layout consistent with ShiftGate/OpenShiftModal (slate/emerald register chrome — match existing).
* `components/auth/AuthGate.tsx` — on mount `bootstrap()`:
  * loading spinner (“Checking session…”);
  * `unauthenticated` → `LoginForm`;
  * `authenticated` → `children`.
* Wire in `RegisterScreen.tsx`:

  ```tsx
  <AuthGate>
    <ShiftGate>…register…</ShiftGate>
  </AuthGate>
  ```

  Order is mandatory: **Auth before Shift**.

### 5. Logout affordance — `CashierMenu.tsx`
* Add **Log out** menu item under Close Shift.
* On click: `await logout()` from auth store; AuthGate returns to Login.

### 6. Prefer `storeId` from `/me`
Replace hard-coded usage where practical:

| Call site | Change |
|-----------|--------|
| `useShiftStore.checkCurrentShift` / `openShift` | Default `storeId` from auth store |
| `ShiftGate` `useEffect` | Pass auth `storeId` into `checkCurrentShift(storeId)` |
| `OpenShiftModal` | Pass auth `storeId` into `openShift(amount, storeId)` |
| `CheckoutFooter` / `CheckoutModal` | `storeId` from auth selector |
| `CustomerSearch` | Pass `storeId` into `searchCustomers(q, storeId)` |

Keep exporting `DEFAULT_STORE_ID` from `api/shifts.ts` as fallback/constant for tests and null-`storeId` edge; pending item “Remove DEFAULT_STORE_ID hardcode” becomes **partially** addressed.

### 7. Docs
* Feature README: contract reminder, bootstrap sequence, seed users, gate order.
* Mark pending FE Auth login + current-user items `[x]` when shipped; note DEFAULT_STORE_ID pending as partial.
* Update `docs/README.md` catalog row **026** + Auth topic line.
* Root README: SPA login now works; remove “401 until 026” warning when shipped.

## Additional Considerations
* **Cookie readability:** Only `XSRF-TOKEN` is JS-readable; never try to read `POS_TOKEN`.
* **CSRF refresh:** After login, Spring may rotate CSRF; re-read cookie on each mutating `apiFetch` (do not cache token forever).
* **Logout 204:** `parseJson` must not require a JSON body on logout.
* **Tests:** Mock `fetch` / auth API; unit-test cookie parser + header injection with `document.cookie` stubs.
* **FE/BE separation:** No backend commits in this feature.
* **Shift ↔ user:** Do not change shift APIs or attribution.
