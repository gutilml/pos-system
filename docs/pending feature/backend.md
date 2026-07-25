# Pending Features — Backend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever backend work is shipped or a new backend gap is found.

**Done pattern (easy scan):** When an item is fully complete, use `[x]` **and** wrap the item text in markdown strikethrough:

```markdown
- [x] ~~**Short title** — Feature NNN: brief note.~~
```

Open / deferred / on-hold items stay `[ ]` with **no** strikethrough. Partials stay `[ ]` with a one-line note of what remains. Promoted-but-not-shipped items stay `[ ]` with a triad path note.

## Phase A — live register wire-up (planned triads)

Backend slice of Phase A (small features, FE/BE separated). Implement in number order where dependencies exist:

| # | Feature folder | Status |
|---|----------------|--------|
| 017 | `docs/features/017-backend-shift-current/` | ~~**Done** — `GET /api/v1/shifts/current?storeId=`~~ |
| 019 | `docs/features/019-backend-customer-search/` | ~~**Done** — `GET /api/v1/customers/search?storeId=&q=`~~ |
| 021 | `docs/features/021-backend-product-search/` | ~~**Done** — `GET /api/v1/products/search?q=` (+ register fields on `ProductDTO`)~~ |

Paired frontend Phase A: 018, 020, 022, 023 (see `docs/pending feature/frontend.md`).

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 010 APIs/code. CARD = external terminal; mark paid on Pay via `COMPLETED` + `payments[]`. Do not schedule Stripe session / IN_PROGRESS-for-Stripe / status-poll as Phase A backend work.

## Shift & cash drawer

- [x] ~~**`GET /api/v1/shifts/current`** — Feature 017: store-scoped open shift or 404 via `ShiftService.getCurrentOpenShift`. Unblocks frontend Feature 018.~~
- [ ] **Shift history / lookup** — e.g. `GET /api/v1/shifts/{id}` and/or list closed shifts for reconciliation reports.
- [ ] **Cashier / user on shifts** — Today shifts are store-only (`shifts` has no user columns). **Decision (2026-07-22): Option C — defer.** Auth v1 ships login/JWT/CSRF without changing shift schema or open/current/close rules (still one OPEN shift per store). Follow-up later: prefer **A** (audit `opened_by` / `closed_by`) before **B** (one open shift per user).
- [ ] **Pay-in / pay-out policy** — Backend events exist; clarify validation rules (reasons required, max amounts, who can authorize). FE UI promoted as Feature **031** (uses current API as-is).
- [x] ~~**Expected cash = CASH tenders only** — Feature 029: starting + CASH payments − change_given + pay-ins − pay-outs. CARD/CREDIT on closed `ShiftDTO` for FE **030**.~~

## Catalog & checkout APIs

- [x] ~~**Product search / barcode lookup** — Feature 021: exact active SKU first, then name/SKU contains; `ProductDTO` includes `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts`.~~
- [x] ~~**Multi SKU/barcode per product (1→N)** — Feature 027: `product_skus`; drop `products.sku`; zero codes OK; hard-delete; `PUT /api/v1/products/{id}/skus`. Paired FE: **028**.~~
- [x] ~~**Product create/update catalog fields** — Feature [050](../features/050-backend-product-create-update/README.md): create+update, wholesale, margin hierarchy (store→category→product), parent package unit/qty, child cost from parent, inventory gated.~~
- [x] ~~**Product target_margin backfill** — Feature [059](../features/059-backend-product-target-margin-backfill/README.md): persist derived margin from cost+selling when missing; migration + seed.~~
- [x] ~~**Categories CRUD** — Feature [051](../features/051-backend-categories-crud/README.md): public category API + `targetMargin`.~~
- [x] ~~**Store settings API** — Feature 045: `preferences` JSONB + GET/PATCH `/stores/{id}/settings` + `uiLocale` on `/me`. Boolean opt-ins stay in `features`. Unlocks FE [046](../features/046-frontend-ui-locale/). Org-level prefs deferred.~~
- [x] ~~**Product stock + inventory flag for SPA** — Feature 042: `currentStock` + `trackInventory` on `ProductDTO`; `enableInventory` on `/auth/me` (+ login). Unblocks FE [043](../features/043-frontend-cart-stock-column/).~~
- [x] ~~**Parent package stock deduction on sale** — Feature [052](../features/052-backend-parent-stock-deduction/README.md): `Δparent = −(sold÷qtyPerPackage)`.~~
- [ ] **Transaction lifecycle** — Hold / void / resume beyond create COMPLETED sale; align with schema statuses. (Stripe checkout already expects `IN_PROGRESS`/`HELD` — Feature 010.) **On hold** (2026-07-23) vs catalog work. Reimburse of COMPLETED sales shipped as Feature [072](../features/072-backend-closed-tickets-reimburse/README.md).
- [x] ~~**Closed tickets list + reimburse (CASH / CREDIT)** — Feature [072](../features/072-backend-closed-tickets-reimburse/README.md): list/get COMPLETED; partial/full return; stock restore; CASH PAY_OUT; CREDIT ledger. Unlocks FE **073**.~~
- [ ] **Reimburse sales that include CARD** — Out of scope for **072**; external/Stripe path TBD.
- [ ] **Restrict reimburse to cashier’s own tickets** — After sale/shift user ownership exists.
- [ ] **Tax source of truth** — Per-store default tax rate vs request-only `taxRate` on transactions. Candidate for `preferences.default_tax_rate` after Feature [045](../features/045-backend-store-preferences/). **On hold** (2026-07-23) vs catalog work.
- [x] ~~**Discount engine (item + global cascade)** — Feature 015: `itemDiscountPercentage` per line, optional `globalDiscountPercentage`, `excludeFromGlobalDiscounts` on products, audit fields + `totalDiscountAmount` on transactions.~~

## Payments

- [x] ~~**Stripe Checkout + webhook** — Feature 010: MXN Checkout Sessions, cents conversion, signature-verified `/api/v1/payments/webhook` completing local transactions.~~
- [ ] **Stripe checkout for split-payment CARD portions** — **ON HOLD (2026-07-17).** Target merchants use a **separate physical card terminal**; POS will not drive Stripe Checkout for CARD tenders for now. **Keep all existing Stripe APIs/code** (Feature 010/011) in the codebase for a later opt-in path — do not delete. When CARD is selected in checkout, treat it like any other tender: on **Pay / Complete Transaction**, persist the sale as paid (`COMPLETED` with `payments[]` including CARD). No Stripe session, no QR modal required for that path.
- [ ] **Create IN_PROGRESS transactions for card sales** — **Deferred with Stripe hold.** Cash/complete path persists `COMPLETED` immediately; revive IN_PROGRESS + Checkout Session when Stripe card-in-POS is re-enabled.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Still useful for Feature 011 QR polling when Stripe resumes; **not blocking** the external-terminal CARD flow. Keep on backlog after Phase A live wire-up unless needed sooner.

## Opt-in modules (vision / schema)

- [x] ~~**Customer credit module** — Feature 012: `Customer` + ledger, `enable_customer_credit` gate, `CREDIT` payment type on transactions, REST create/ledger/payments.~~
- [x] ~~**Customer identity list/update/delete** — Feature [060](../features/060-backend-customer-identity-update/README.md): empty-q list, get/update/delete, identity ungated; ledger/pay still credit-gated; `enableCustomerCredit` on `/me`. Unlocks FE **061**.~~
- [x] ~~**Customer payment tender (CASH / CARD)** — Feature [067](../features/067-backend-customer-payment-tender/README.md): paymentMethod on pay; ledger column; CASH PAY_IN → expected cash; CARD external; require open shift. Unlocks FE **068**.~~
- [x] ~~**Credit ledger description locale snapshot** — Feature [069](../features/069-backend-credit-ledger-description/README.md): freeze movement label in store `ui_locale` at write. Unlocks FE **070**.~~
- [x] ~~**Customer credit UI** — Register CREDIT (**014**/**037**) + Customers workspace (**061**).~~
- [x] ~~**Customer search API** — Feature 019: store-scoped name/phone search (`enable_customer_credit` gated), max 20 results as `CustomerDTO[]`.~~
- [ ] **Multi-tier / customer pricing** — Feature 015 shipped percentage discount cascade; customer-specific or tier-based price lists still not designed.
- [x] ~~**Inventory admin APIs** — Feature [062](../features/062-backend-inventory-movements/README.md): movements receive/adjust, history, wholesale_margin, sale may go negative. Unlocks FE **063**.~~
- [ ] **Notify admin/restock owner when sale drives stock negative** — Out of scope for 062/063 (register warning only on FE).
- [ ] **When inventory disabled: optional delete/purge inventory data?** — Open question; Inventory tab stays read-only with last data (063).

## Platform / ops

### Auth decisions (2026-07-22) — for upcoming Feature 025+

- **Token:** JWT in **HttpOnly** cookies (stateless; no DB session lookup per request).
- **CSRF:** Spring CSRF with readable `XSRF-TOKEN` cookie; SPA sends `X-XSRF-TOKEN` on mutating requests (Axios/fetch helper).
- **CORS:** Strict allowlist — only the React app origin.
- **Roles (v1):** `ADMIN` + `CASHIER` only; **for now both can do everything** (roles exist for future gating; no manager role yet).
- **Tenancy (v1):** **Single store** only (continue using the demo store / one `store_settings` row). Multi-org / multi-store deferred (see below).
- **User provisioning (v1):** Seed and/or SQL only — **no** user CRUD API yet (deferred below).
- **Shift ↔ user:** **Deferred (Option C, 2026-07-22).** Auth v1 does not change shift open/current/close; still one open shift per store. Later: audit stamps (A), then optional per-user shifts (B).

- [x] ~~**AuthN/AuthZ (v1)** — Feature 025: Spring Security + JWT HttpOnly cookie (`POS_TOKEN`) + CSRF + strict CORS; roles ADMIN/CASHIER (equal permissions).~~
- [x] ~~**System users table (v1)** — Feature 025: `users` table + seed `admin`/`admin` and `cashier`/`cashier`.~~
- [x] ~~**Login / logout / me APIs (v1)** — Feature 025: `GET /auth/csrf`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.~~
- [ ] **User management API** — Create / update / deactivate / list users (ADMIN). **Deferred** after Auth v1 login works. Pair with FE user-mgmt screen.
- [ ] **Role-based authorization policies** — Deferred: when ADMIN vs CASHIER should differ (drawer rules, catalog admin, etc.). v1: both allowed everywhere once authenticated.
- [ ] **Multi-organization / multi-store tenancy** — Future model: organizations (e.g. Oxxo, Walmart) → many stores under an org; same platform serving multiple orgs. Not in Auth v1. Needs org tables, store membership, and picker UX later.
- [ ] **CORS / API versioning conventions** — Partially decided (strict React origin for Auth v1); confirm for SPA + Fargate deployment hosts/env.
- [x] ~~**Seed data / fixtures** — `docs/seed-data.sql`: fixed store UUID, 3 categories, **18 products** (base + similar-name typeahead set; 2 weight + 1 no-global-discount), 2 credit customers, admin + cashier. Re-runnable (clears demo-store transactions).~~

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
