# Documentation index

**Start here** when you need a topic: scan this file, then open the linked README (or triad) instead of browsing feature folders one by one.

| Quick jump | Path |
|------------|------|
| Architecture / stack | [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) |
| Agent / git / FE·BE rules | [`.cursorrules`](../.cursorrules) |
| Pending backend backlog | [`pending feature/backend.md`](pending%20feature/backend.md) |
| Pending frontend backlog | [`pending feature/frontend.md`](pending%20feature/frontend.md) |
| Database schema reference | [`database-schema.sql`](database-schema.sql) |
| Local demo seed data | [`seed-data.sql`](seed-data.sql) |
| Local run instructions | [`../README.md`](../README.md) |

Each shipped or planned feature lives under `docs/features/00N-*/` with a small README plus (usually) `spec.md`, `plan.md`, and `tasks.md`.

---

## Topic → where to go

Use this table when you know the *subject*, not the feature number.

| Topic | Primary README(s) | Notes |
|-------|-------------------|--------|
| **Data model / JPA** | [002](features/002-backend-data-layer/README.md) | Entities + repositories from schema |
| **Core catalog + checkout API** | [003](features/003-backend-core-api/README.md) | Products, transactions, DTOs/services |
| **Register UI shell** | [004](features/004-frontend-register-ui/README.md) | Search, cart, footer layout |
| **Inventory (opt-in)** | [005](features/005-backend-inventory-module/README.md) | Stock deduct when `enable_inventory` |
| **Weight / bulk sell** | [006](features/006-frontend-bulk-weight-modal/README.md) | Weight modal + optional scale |
| **Shifts / cash drawer (API)** | [007](features/007-backend-shift-management/README.md), [017](features/017-backend-shift-current/README.md) | Open / events / close; **017** = `GET …/current` (planned) |
| **Shift gate UI** | [008](features/008-frontend-shift-ui/README.md), [018](features/018-frontend-shift-gate-hydration/README.md) | Gate + persist; **018** = no fail-open (planned) |
| **Multi-ticket tabs** | [009](features/009-frontend-open-tickets/README.md) | Client-side held tickets |
| **Stripe (backend)** | [010](features/010-backend-stripe-integration/README.md) | Checkout Session + webhook — **keep code; Stripe-in-POS ON HOLD** |
| **Stripe QR UI** | [011](features/011-frontend-stripe-ui/README.md) | QR + polling — **keep code; ON HOLD** |
| **Customer credit (API)** | [012](features/012-backend-customer-credit/README.md), [019](features/019-backend-customer-search/README.md) | Ledger / CREDIT; **019** = search (planned) |
| **Split payments (API)** | [013](features/013-backend-split-payments/README.md) | `payments[]` + `transaction_payments` |
| **Checkout modal / CREDIT UI** | [014](features/014-frontend-split-payments-credit/README.md), [020](features/020-frontend-customer-search-wireup/README.md) | Tenders + customer assign; **020** = live search (planned) |
| **Discounts (API math)** | [015](features/015-backend-discount-engine/README.md) | Item + global cascade, exclusions |
| **Discounts (register UI)** | [016](features/016-frontend-discount-ui/README.md) | Item % / global % / strikethrough |
| **Product search / barcode** | [021](features/021-backend-product-search/README.md), [022](features/022-frontend-live-product-catalog/README.md) | Live catalog wire-up (planned) |
| **CARD = external terminal** | [023](features/023-frontend-external-terminal-card/README.md) | Mark paid on Pay; no Stripe QR (planned) |
| **Close shift discrepancy print** | Pending only (not a triad yet) | See [frontend pending](pending%20feature/frontend.md) / [backend pending](pending%20feature/backend.md) — no manager auth; print ticket |
| **Auth / RBAC / users** | Pending only | Needs clarity — see pending docs |
| **Product update / categories** | Pending only | Needs clarity — see pending docs |

---

## Feature catalog (by number)

Status: **Done** = implemented & committed · **Planned** = triad written, not implemented · **On hold** = code may exist but product path deferred.

| # | Side | Status | Folder README | Triad |
|---|------|--------|---------------|-------|
| 002 | BE | Done | [README](features/002-backend-data-layer/README.md) | [spec](features/002-backend-data-layer/specs.md) · [plan](features/002-backend-data-layer/plan.md) · [tasks](features/002-backend-data-layer/tasks.md) |
| 003 | BE | Done | [README](features/003-backend-core-api/README.md) | [spec](features/003-backend-core-api/spec.md) · [plan](features/003-backend-core-api/plan.md) · [tasks](features/003-backend-core-api/tasks.md) |
| 004 | FE | Done | [README](features/004-frontend-register-ui/README.md) | [spec](features/004-frontend-register-ui/spce.md) · [plan](features/004-frontend-register-ui/plan.md) · [tasks](features/004-frontend-register-ui/tasks.md) |
| 005 | BE | Done | [README](features/005-backend-inventory-module/README.md) | [spec](features/005-backend-inventory-module/spec.md) · [plan](features/005-backend-inventory-module/plan.md) · [tasks](features/005-backend-inventory-module/tasks.md) |
| 006 | FE | Done | [README](features/006-frontend-bulk-weight-modal/README.md) | [spec](features/006-frontend-bulk-weight-modal/spec.md) · [plan](features/006-frontend-bulk-weight-modal/plan.md) · [tasks](features/006-frontend-bulk-weight-modal/tasks.md) |
| 007 | BE | Done | [README](features/007-backend-shift-management/README.md) | [spec](features/007-backend-shift-management/spec.md) · [plan](features/007-backend-shift-management/plan.md) · [tasks](features/007-backend-shift-management/task.md) |
| 008 | FE | Done | [README](features/008-frontend-shift-ui/README.md) | [spec](features/008-frontend-shift-ui/spec.md) · [plan](features/008-frontend-shift-ui/plan.md) · [tasks](features/008-frontend-shift-ui/tasks.md) |
| 009 | FE | Done | [README](features/009-frontend-open-tickets/README.md) | [spec](features/009-frontend-open-tickets/spec.md) · [plan](features/009-frontend-open-tickets/plan.md) · [tasks](features/009-frontend-open-tickets/tasks.md) |
| 010 | BE | Done (Stripe path **on hold**) | [README](features/010-backend-stripe-integration/README.md) | [spec](features/010-backend-stripe-integration/spec.md) · [plan](features/010-backend-stripe-integration/plan.md) · [tasks](features/010-backend-stripe-integration/tasks.md) |
| 011 | FE | Done (Stripe path **on hold**) | [README](features/011-frontend-stripe-ui/README.md) | [spec](features/011-frontend-stripe-ui/spce.md) · [plan](features/011-frontend-stripe-ui/plan.md) · [tasks](features/011-frontend-stripe-ui/tasks.md) |
| 012 | BE | Done | [README](features/012-backend-customer-credit/README.md) | [spec](features/012-backend-customer-credit/spec.md) · [plan](features/012-backend-customer-credit/plan.md) · [tasks](features/012-backend-customer-credit/tasks.md) |
| 013 | BE | Done | [README](features/013-backend-split-payments/README.md) | [spec](features/013-backend-split-payments/spec.md) · [plan](features/013-backend-split-payments/plan.md) · [tasks](features/013-backend-split-payments/tasks,md) |
| 014 | FE | Done | [README](features/014-frontend-split-payments-credit/README.md) | [spec](features/014-frontend-split-payments-credit/spec.md) · [plan](features/014-frontend-split-payments-credit/plan.md) · [tasks](features/014-frontend-split-payments-credit/tasks.md) |
| 015 | BE | Done | [README](features/015-backend-discount-engine/README.md) | [spec](features/015-backend-discount-engine/spec.md) · [plan](features/015-backend-discount-engine/plan.md) · [tasks](features/015-backend-discount-engine/tasks.md) |
| 016 | FE | Done | [README](features/016-frontend-discount-ui/README.md) | [spec](features/016-frontend-discount-ui/spec.md) · [plan](features/016-frontend-discount-ui/plan.md) · [tasks](features/016-frontend-discount-ui/tasks.md) |
| 017 | BE | Done | [README](features/017-backend-shift-current/README.md) | [spec](features/017-backend-shift-current/spec.md) · [plan](features/017-backend-shift-current/plan.md) · [tasks](features/017-backend-shift-current/tasks.md) |
| 018 | FE | Done | [README](features/018-frontend-shift-gate-hydration/README.md) | [spec](features/018-frontend-shift-gate-hydration/spec.md) · [plan](features/018-frontend-shift-gate-hydration/plan.md) · [tasks](features/018-frontend-shift-gate-hydration/tasks.md) |
| 019 | BE | Done | [README](features/019-backend-customer-search/README.md) | [spec](features/019-backend-customer-search/spec.md) · [plan](features/019-backend-customer-search/plan.md) · [tasks](features/019-backend-customer-search/tasks.md) |
| 020 | FE | Done | [README](features/020-frontend-customer-search-wireup/README.md) | [spec](features/020-frontend-customer-search-wireup/spec.md) · [plan](features/020-frontend-customer-search-wireup/plan.md) · [tasks](features/020-frontend-customer-search-wireup/tasks.md) |
| 021 | BE | Done | [README](features/021-backend-product-search/README.md) | [spec](features/021-backend-product-search/spec.md) · [plan](features/021-backend-product-search/plan.md) · [tasks](features/021-backend-product-search/tasks.md) |
| 022 | FE | Done | [README](features/022-frontend-live-product-catalog/README.md) | [spec](features/022-frontend-live-product-catalog/spec.md) · [plan](features/022-frontend-live-product-catalog/plan.md) · [tasks](features/022-frontend-live-product-catalog/tasks.md) |
| 023 | FE | Done | [README](features/023-frontend-external-terminal-card/README.md) | [spec](features/023-frontend-external-terminal-card/spec.md) · [plan](features/023-frontend-external-terminal-card/plan.md) · [tasks](features/023-frontend-external-terminal-card/tasks.md) |

---

## Phase A (next implementation order)

Live register wire-up. Prefer **backend then matching frontend**. Stripe session/QR work is **not** in this phase.

1. [017](features/017-backend-shift-current/README.md) → [018](features/018-frontend-shift-gate-hydration/README.md)
2. [019](features/019-backend-customer-search/README.md) → [020](features/020-frontend-customer-search-wireup/README.md)
3. [021](features/021-backend-product-search/README.md) → [022](features/022-frontend-live-product-catalog/README.md)
4. [023](features/023-frontend-external-terminal-card/README.md) — CARD = external terminal; mark paid on Pay

---

## How to review a feature triad

1. Open this index → click the feature **README** for a one-screen summary.
2. For requirements / design / checklist: `spec.md` → `plan.md` → `tasks.md` in the same folder.
3. After shipping: mark pending items in `docs/pending feature/*` and keep this index status column updated.

---

## Maintenance

When you add `docs/features/00N-*/README.md`, add a row to **Feature catalog** and a line under **Topic → where to go** in the same change. Do not leave orphan READMEs without an index entry.
