# Pending Features — Frontend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever frontend work is shipped or a new frontend gap is found.

**When an item ships:** **delete it** from this list (history lives in `docs/features/` + the catalog in `docs/README.md`).

Open / deferred / on-hold items stay `[ ]`. Partials stay `[ ]` with a one-line note of what remains. Promoted-but-not-shipped items stay `[ ]` with a triad path note.

## Phase A — live register wire-up

Phase A register wire-up features are shipped. Paired backend: 017, 019, 021.

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 011 code. External terminal + mark paid on Complete. Do not schedule Stripe QR / status-poll as Phase A work.

## Wire-up to live backend

- [ ] **Complete Sale → checkout error UX** — Card path and split-pay **Pay** modal (Feature 014) both POST transactions. Remaining gap: richer error/toast UX when `POST /api/v1/transactions` fails.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Feature 011 polls this for Stripe QR auto-complete. **On hold with Stripe-in-POS** — not required while CARD is external-terminal + mark-paid-on-Complete.

## Payments (frontend)

- [ ] **Split-pay CARD → Stripe session** — **ON HOLD** with Stripe-in-POS; revive when integrated card is re-enabled.
- [ ] **CARD reimburse UI** — triad: [`085-frontend-card-reimburse`](../features/085-frontend-card-reimburse/README.md). **Deferred**; depends on BE **084**.

## Shift UX

- [ ] **Remove `DEFAULT_STORE_ID` hardcode** — Feature 026 prefers `/me.storeId` via `selectStoreId`; constant remains as unauthenticated/fallback until multi-store picker.
- [ ] **Shift status in header** — Open-since time, starting cash, quick indicator while selling. Not yet a numbered triad.

## Register / cart

- [ ] **Offline / API error toasts** — Consistent handling when open/close/checkout/product calls fail.
- [ ] **Void / hold tickets UI** — triad: [`083-frontend-transaction-lifecycle`](../features/083-frontend-transaction-lifecycle/README.md). **Deferred**; depends on BE **082**. May replace or complement client-only TicketTabs (**009**).

## Auth & multi-store

### Auth decisions (2026-07-22) — mirror backend pending

- JWT in HttpOnly cookies + CSRF (`XSRF-TOKEN` / `X-XSRF-TOKEN`) + credentials on API calls.
- Roles ADMIN + CASHIER; **equal permissions for now** (no role-gated UI yet).
- Single store for now; drop `DEFAULT_STORE_ID` hardcode in favor of store from auth/config once BE exposes it on `/me` (or keep seed UUID until then).
- User management **UI deferred** until user CRUD API exists.
- Shift ↔ user linking: FE **080** opener/closer labels shipped (after BE **079**).

- [ ] **System user management UI** — Admin screens to create/edit/deactivate users. **Deferred** with backend user CRUD API.
- [ ] **Role-gated navigation and actions** — Deferred until ADMIN vs CASHIER permissions diverge. Shift close with discrepancy remains cashier-allowed; no manager override for variance.
- [ ] **Store picker / multi-org UX** — Deferred with multi-organization / multi-store tenancy (Oxxo-, Walmart-style orgs with many stores). Not in Auth v1.

## Opt-in module UIs

- [ ] **Notify admin when sale drives stock negative** — triad: [`092-frontend-negative-stock-notify`](../features/092-frontend-negative-stock-notify/README.md). **Deferred**; depends on BE **091**.

## Tooling / quality

- [ ] **Accessibility pass** — Modals, focus traps, scanner-first keyboard flow.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
