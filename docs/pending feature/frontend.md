# Pending Features — Frontend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever frontend work is shipped or a new frontend gap is found. Mark done items `[x]`, note partials, and append newly discovered follow-ups.

## Phase A — live register wire-up (planned triads)

Frontend slice of Phase A (small features, FE/BE separated). Pair with backend 017 → 019 → 021:

| # | Feature folder | Status |
|---|----------------|--------|
| 018 | `docs/features/018-frontend-shift-gate-hydration/` | **Done** — honest ShiftGate (no fail-open on API error) |
| 020 | `docs/features/020-frontend-customer-search-wireup/` | **Done** — `storeId` + live search |
| 022 | `docs/features/022-frontend-live-product-catalog/` | **Done** — replace `mockProducts` with live search |
| 023 | `docs/features/023-frontend-external-terminal-card/` | **Done** — CARD = mark paid on Pay; Stripe QR off happy path |

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 011 code. External terminal + mark paid on Complete. Do not schedule Stripe QR / status-poll as Phase A work.

## Wire-up to live backend

- [x] **Replace mock catalog** — Feature 022: `SearchBar` uses `GET /products/search`; `mockProducts.ts` removed.
- [ ] **Complete Sale → `POST /api/v1/transactions`** — Card path and split-pay **Pay** modal (Feature 014) both POST transactions. Legacy single-amount cash path removed; remaining gap is richer error/toast UX when POST fails.
- [x] **Dev API proxy** — Feature 011: Vite `server.proxy` forwards `/api` → `http://localhost:8080`.
- [x] **`GET /api/v1/shifts/current` dependency** — Feature 018: `fetchCurrentShift(storeId)` + ShiftGate Retry on API failure (no fail-open). Backend Feature 017.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Feature 011 polls this for Stripe QR auto-complete. **On hold with Stripe-in-POS** — not required while CARD is external-terminal + mark-paid-on-Complete.
- [x] **Adopt `payments[]` transaction payload** — Feature 014: `createTransaction` + CheckoutModal send Feature 013 `payments[]` (+ `customerId` when credit is used).
- [x] **`GET /api/v1/customers/search`** — Feature 020: `searchCustomers` sends `storeId` + `q` (Feature 019 backend).

## Payments (frontend)

- [x] **Stripe QR checkout modal + polling** — Feature 011 shipped; **keep in codebase**. Stripe-in-POS path **ON HOLD (2026-07-17)** for small-store design (external card terminal).
- [x] **Split payments + store-tab assignment UI** — Feature 014: CheckoutModal tenders, CREDIT customer interception, `payments[]` checkout POST.
- [x] **Cash / multi-tender Complete Sale persistence** — Feature 014 Pay → Complete Transaction POSTs and closes the ticket on success.
- [x] **CARD tender = mark paid on Pay (external terminal)** — Feature 023: Card button POSTs `COMPLETED` + CARD tender (no Stripe QR). Pay modal CARD tenders unchanged. Stripe client code kept (ON HOLD).
- [ ] **Split-pay CARD → Stripe session** — **ON HOLD** with Stripe-in-POS; revive when integrated card is re-enabled.

## Shift UX polish

- [ ] **Remove `DEFAULT_STORE_ID` hardcode** — Store selection or auth-derived store context.
- [ ] **Cash drawer pay-in / pay-out UI** — Backend `POST /shifts/{id}/events` exists; no cashier UI yet.
- [x] **Post-close discrepancy ticket** — Feature 024: after blind close, `ShiftCloseTicket` shows API expected/actual/discrepancy; Print via `window.print`; Done → Open Shift gate. No manager auth.
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
