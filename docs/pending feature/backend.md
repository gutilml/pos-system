# Pending Features — Backend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever backend work is shipped or a new backend gap is found. Mark done items `[x]`, note partials, and append newly discovered follow-ups.

## Shift & cash drawer

- [ ] **`GET /api/v1/shifts/current`** — Frontend ShiftGate already calls this for zero-trust hydration. Feature 007 only shipped open / events / close. Need store-scoped (and later user-scoped) “open shift or 404”.
- [ ] **Shift history / lookup** — e.g. `GET /api/v1/shifts/{id}` and/or list closed shifts for reconciliation reports.
- [ ] **Cashier / user on shifts** — Today shifts are store-only. Decide how authenticated cashier identity attaches to open/close and drawer events.
- [ ] **Pay-in / pay-out policy** — Backend events exist; clarify validation rules (reasons required, max amounts, who can authorize).

## Catalog & checkout APIs

- [ ] **Product search / barcode lookup** — Register still needs fast SKU/barcode resolve (query params or dedicated endpoint). Core today is list + get-by-id.
- [ ] **Product update / deactivate** — Create exists; update/delete (or soft-deactivate via `isActive`) not exposed.
- [ ] **Categories CRUD** — Entities exist; no public category API yet.
- [ ] **Store settings API** — Read/update `features` JSONB (`enable_inventory`, `enable_customer_credit`, etc.) so clients can opt-in correctly.
- [ ] **Transaction lifecycle** — Hold / void / resume beyond create COMPLETED sale; align with schema statuses. (Stripe checkout already expects `IN_PROGRESS`/`HELD` — Feature 010.)
- [ ] **Tax source of truth** — Per-store default tax rate vs request-only `taxRate` on transactions.

## Payments

- [x] **Stripe Checkout + webhook** — Feature 010: MXN Checkout Sessions, cents conversion, signature-verified `/api/v1/payments/webhook` completing local transactions.
- [ ] **Create IN_PROGRESS transactions for card sales** — Cash path still persists `COMPLETED` immediately; card flow needs an API to open `IN_PROGRESS` tickets before `POST /payments/checkout/{id}`.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Required by Feature 011 QR polling (`paymentApi.getTransactionStatus`).
- [x] **Frontend Stripe QR / return UX** — Feature 011 shipped QR modal + polling (see frontend pending for live status endpoint dependency).
- [x] **Split payments (multiple tenders per sale)** — Feature 013: `transaction_payments` one-to-many, `payments[]` in the transaction API, BigDecimal sum validation, per-tender CREDIT routing to the customer ledger.
- [ ] **Stripe checkout for split-payment CARD portions** — Stripe Checkout (Feature 010) still charges the full transaction total; a CARD tender inside a split sale is recorded locally but not routed through Stripe yet.

## Opt-in modules (vision / schema)

- [x] **Customer credit module** — Feature 012: `Customer` + ledger, `enable_customer_credit` gate, `CREDIT` payment type on transactions, REST create/ledger/payments.
- [ ] **Customer credit UI** — Frontend register/tab pay-down screens (see frontend pending).
- [ ] **Multi-tier / customer pricing** — Mentioned in project vision; not designed.
- [ ] **Inventory admin APIs** — Stock adjustments, receiving, low-stock reporting (checkout deduction already exists when enabled).

## Platform / ops

- [ ] **AuthN/AuthZ** — Spring Security, roles (cashier / manager / admin), store tenancy.
- [ ] **CORS / API versioning conventions** — Confirm for SPA + Fargate deployment.
- [ ] **Seed data / fixtures** — Deterministic store + products for local/dev demos.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
