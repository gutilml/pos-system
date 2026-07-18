# Pending Features — Frontend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever frontend work is shipped or a new frontend gap is found. Mark done items `[x]`, note partials, and append newly discovered follow-ups.

## Phase A — live register wire-up (planned triads)

Frontend slice of Phase A (small features, FE/BE separated). Pair with backend 017 → 019 → 021:

| # | Feature folder | Status |
|---|----------------|--------|
| 018 | `docs/features/018-frontend-shift-gate-hydration/` | Planned — honest ShiftGate (no fail-open on API error); needs 017 |
| 020 | `docs/features/020-frontend-customer-search-wireup/` | Planned — `storeId` + live search; needs 019 |
| 022 | `docs/features/022-frontend-live-product-catalog/` | Planned — replace `mockProducts`; needs 021 |
| 023 | `docs/features/023-frontend-external-terminal-card/` | Planned — CARD = mark paid on Pay; Stripe QR off happy path |

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 011 code. External terminal + mark paid on Complete. Do not schedule Stripe QR / status-poll as Phase A work.

## Wire-up to live backend

- [ ] **Replace mock catalog** — `mockProducts.ts` still drives SearchBar. Point search/scan at Product APIs (list + barcode lookup once backend exposes it). **Promoted:** `docs/features/022-frontend-live-product-catalog/` (after 021).
- [ ] **Complete Sale → `POST /api/v1/transactions`** — Card path and split-pay **Pay** modal (Feature 014) both POST transactions. Legacy single-amount cash path removed; remaining gap is richer error/toast UX when POST fails.
- [x] **Dev API proxy** — Feature 011: Vite `server.proxy` forwards `/api` → `http://localhost:8080`.
- [ ] **`GET /api/v1/shifts/current` dependency** — UI already calls it; blocked on backend endpoint (see backend pending). Until then hydration fails open / shows Open Shift after error. **Promoted:** backend 017 + frontend `docs/features/018-frontend-shift-gate-hydration/` (fix fail-open).
- [ ] **`GET /api/v1/transactions/{id}/status`** — Feature 011 polls this for Stripe QR auto-complete. **On hold with Stripe-in-POS** — not required while CARD is external-terminal + mark-paid-on-Complete.
- [x] **Adopt `payments[]` transaction payload** — Feature 014: `createTransaction` + CheckoutModal send Feature 013 `payments[]` (+ `customerId` when credit is used).
- [ ] **`GET /api/v1/customers/search`** — CustomerSearch UI shipped (Feature 014); blocked on backend search API (see backend pending). **Promoted:** backend 019 + frontend `docs/features/020-frontend-customer-search-wireup/`.

## Payments (frontend)

- [x] **Stripe QR checkout modal + polling** — Feature 011 shipped; **keep in codebase**. Stripe-in-POS path **ON HOLD (2026-07-17)** for small-store design (external card terminal).
- [x] **Split payments + store-tab assignment UI** — Feature 014: CheckoutModal tenders, CREDIT customer interception, `payments[]` checkout POST.
- [x] **Cash / multi-tender Complete Sale persistence** — Feature 014 Pay → Complete Transaction POSTs and closes the ticket on success.
- [ ] **CARD tender = mark paid on Pay (external terminal)** — **Decision (2026-07-17):** Do not open Stripe QR for CheckoutModal CARD tenders. Cashier takes card on a separate terminal, adds CARD tender(s), clicks **Pay / Complete**; system records sale as paid. Prefer simplifying Card button / Stripe modal later so it does not confuse cashiers; do not delete payment API clients yet. **Promoted:** `docs/features/023-frontend-external-terminal-card/`.
- [ ] **Split-pay CARD → Stripe session** — **ON HOLD** with Stripe-in-POS; revive when integrated card is re-enabled.

## Shift UX polish

- [ ] **Remove `DEFAULT_STORE_ID` hardcode** — Store selection or auth-derived store context.
- [ ] **Cash drawer pay-in / pay-out UI** — Backend `POST /shifts/{id}/events` exists; no cashier UI yet.
- [ ] **Post-close discrepancy ticket** — Blind count submits `actualCash`; after close, show/print a close ticket with expected cash, counted cash, and discrepancy. **Decision (2026-07-17):** no manager auth to close with variance; printing the discrepancy ticket is the system’s end of responsibility (no override/approval flow).
- [ ] **Shift status in header** — Open-since time, starting cash, quick indicator while selling.

## Register / cart

- [x] **Item and global discount UI** — Feature 016: per-line item `%`, footer global `%`, backend-aligned cascade math (`discountPricing.ts`), strikethrough + “No Global %” badge, API payload fields on Pay and Card checkout.
- [ ] **Tax rate from store settings** — Today cart `taxRate` is local state; load from backend when settings API exists.
- [ ] **Offline / API error toasts** — Consistent handling when open/close/checkout/product calls fail.
- [x] **Open / held tickets (tabs)** — Feature 009: multi-ticket Zustand + `TicketTabs` (client-side hold/switch). Void / server-backed held tickets still pending.
- [ ] **Void tickets** — UI for void once backend supports those statuses.
- [ ] **Receipt / print** — After successful transaction (browser print or receipt printer).

## Auth & multi-store

- [ ] **Login / session** — Cashier identity for shift gate and audit.
- [ ] **System user management UI** — Admin/manager screens to create, edit, deactivate, and assign cashier / manager / admin users to stores once backend user APIs exist.
- [ ] **Current-user context** — Replace hardcoded cashier/store assumptions with authenticated user + role + store context for shift, checkout, and admin flows.
- [ ] **Role-gated navigation and actions** — Hide or block manager/admin-only UI such as drawer adjustments, inventory/admin screens, and user management. **Needs clarity** with backend RBAC (which screens/actions). Shift close with discrepancy is cashier-allowed; no manager override UI planned for variance.
- [ ] **Store picker** — Multi-store merchants; stop using a single hardcoded UUID.

## Opt-in module UIs

- [ ] **Inventory screens** — Stock levels, adjustments, low-stock — only when `enable_inventory` is true.
- [ ] **Customer credit UI** — Feature 014 shipped checkout assignment + CREDIT tender interception. Still missing dedicated tab pay-down / ledger screens outside checkout.

## Tooling / quality

- [ ] **E2E smoke** — Open shift → scan → weight item → checkout → close shift against a running backend.
- [ ] **Accessibility pass** — Modals, focus traps, scanner-first keyboard flow.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
