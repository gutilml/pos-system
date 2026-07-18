# Pending Features — Backend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever backend work is shipped or a new backend gap is found. Mark done items `[x]`, note partials, and append newly discovered follow-ups.

## Phase A — live register wire-up (planned triads)

Backend slice of Phase A (small features, FE/BE separated). Implement in number order where dependencies exist:

| # | Feature folder | Status |
|---|----------------|--------|
| 017 | `docs/features/017-backend-shift-current/` | **Done** — `GET /api/v1/shifts/current?storeId=` |
| 019 | `docs/features/019-backend-customer-search/` | **Done** — `GET /api/v1/customers/search?storeId=&q=` |
| 021 | `docs/features/021-backend-product-search/` | **Done** — `GET /api/v1/products/search?q=` (+ register fields on `ProductDTO`) |

Paired frontend Phase A: 018, 020, 022, 023 (see `docs/pending feature/frontend.md`).

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 010 APIs/code. CARD = external terminal; mark paid on Pay via `COMPLETED` + `payments[]`. Do not schedule Stripe session / IN_PROGRESS-for-Stripe / status-poll as Phase A backend work.

## Shift & cash drawer

- [x] **`GET /api/v1/shifts/current`** — Feature 017: store-scoped open shift or 404 via `ShiftService.getCurrentOpenShift`. Unblocks frontend Feature 018.
- [ ] **Shift history / lookup** — e.g. `GET /api/v1/shifts/{id}` and/or list closed shifts for reconciliation reports.
- [ ] **Cashier / user on shifts** — Today shifts are store-only. Decide how authenticated cashier identity attaches to open/close and drawer events.
- [ ] **Pay-in / pay-out policy** — Backend events exist; clarify validation rules (reasons required, max amounts, who can authorize).

## Catalog & checkout APIs

- [x] **Product search / barcode lookup** — Feature 021: exact active SKU first, then name/SKU contains; `ProductDTO` includes `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts`.
- [ ] **Product update / deactivate** — Create exists; update/delete (or soft-deactivate via `isActive`) not exposed.
- [ ] **Categories CRUD** — Entities exist; no public category API yet.
- [ ] **Store settings API** — Read/update `features` JSONB (`enable_inventory`, `enable_customer_credit`, etc.) so clients can opt-in correctly.
- [ ] **Transaction lifecycle** — Hold / void / resume beyond create COMPLETED sale; align with schema statuses. (Stripe checkout already expects `IN_PROGRESS`/`HELD` — Feature 010.)
- [ ] **Tax source of truth** — Per-store default tax rate vs request-only `taxRate` on transactions.
- [x] **Discount engine (item + global cascade)** — Feature 015: `itemDiscountPercentage` per line, optional `globalDiscountPercentage`, `excludeFromGlobalDiscounts` on products, audit fields + `totalDiscountAmount` on transactions.

## Payments

- [x] **Stripe Checkout + webhook** — Feature 010: MXN Checkout Sessions, cents conversion, signature-verified `/api/v1/payments/webhook` completing local transactions.
- [ ] **Stripe checkout for split-payment CARD portions** — **ON HOLD (2026-07-17).** Target merchants use a **separate physical card terminal**; POS will not drive Stripe Checkout for CARD tenders for now. **Keep all existing Stripe APIs/code** (Feature 010/011) in the codebase for a later opt-in path — do not delete. When CARD is selected in checkout, treat it like any other tender: on **Pay / Complete Transaction**, persist the sale as paid (`COMPLETED` with `payments[]` including CARD). No Stripe session, no QR modal required for that path.
- [ ] **Create IN_PROGRESS transactions for card sales** — **Deferred with Stripe hold.** Cash/complete path persists `COMPLETED` immediately; revive IN_PROGRESS + Checkout Session when Stripe card-in-POS is re-enabled.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Still useful for Feature 011 QR polling when Stripe resumes; **not blocking** the external-terminal CARD flow. Keep on backlog after Phase A live wire-up unless needed sooner.

## Opt-in modules (vision / schema)

- [x] **Customer credit module** — Feature 012: `Customer` + ledger, `enable_customer_credit` gate, `CREDIT` payment type on transactions, REST create/ledger/payments.
- [ ] **Customer credit UI** — Feature 014 shipped register CREDIT assignment at checkout; dedicated tab pay-down screens still pending (see frontend).
- [x] **Customer search API** — Feature 019: store-scoped name/phone search (`enable_customer_credit` gated), max 20 results as `CustomerDTO[]`.
- [ ] **Multi-tier / customer pricing** — Feature 015 shipped percentage discount cascade; customer-specific or tier-based price lists still not designed.
- [ ] **Inventory admin APIs** — Stock adjustments, receiving, low-stock reporting (checkout deduction already exists when enabled).

## Platform / ops

- [ ] **AuthN/AuthZ** — Spring Security, roles (cashier / manager / admin), store tenancy.
- [ ] **System user accounts** — Add backend-owned cashier / manager / admin users, including create/update/deactivate APIs, password handling, store assignment, and audit-friendly identity fields separate from customer credit accounts.
- [ ] **Session / login APIs** — Issue and validate authenticated sessions or JWTs for the frontend, including logout / refresh behavior and current-user lookup.
- [ ] **Role-based authorization policies** — Enforce manager-only operations (drawer adjustments, shift close overrides, product/admin changes) and cashier-scoped checkout actions at the controller/service boundary.
- [ ] **CORS / API versioning conventions** — Confirm for SPA + Fargate deployment.
- [ ] **Seed data / fixtures** — Deterministic store + products for local/dev demos.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
