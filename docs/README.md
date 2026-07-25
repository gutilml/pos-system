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
| **Inventory (opt-in)** | [005](features/005-backend-inventory-module/README.md), [042](features/042-backend-product-stock-inventory-flag/README.md), [043](features/043-frontend-cart-stock-column/README.md) | Stock deduct when `enable_inventory`; **042** SPA stock/flag fields done; **043** cart Stock column done |
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
| **Close shift discrepancy print** | [024](features/024-frontend-shift-discrepancy-ticket/README.md) | No manager auth; browser print ticket after blind close |
| **Auth / RBAC / users** | [025](features/025-backend-auth-v1/README.md), [026](features/026-frontend-auth-v1/README.md) | BE + FE Auth v1 done. User CRUD / role policies / multi-store deferred. |
| **Multi SKU / barcode (1→N)** | [027](features/027-backend-multi-sku/README.md), [028](features/028-frontend-multi-sku/README.md) | BE + FE done. Admin SKU UI deferred. |
| **Expected cash / close ticket tenders** | [029](features/029-backend-expected-cash-tenders/README.md), [030](features/030-frontend-shift-close-ticket-tenders/README.md) | BE **029** + FE **030** done. |
| **Cash drawer pay-in / pay-out UI** | [031](features/031-frontend-cash-drawer-pay-in-out/README.md) | FE **031** done (Feature 007 events API). |
| **Weight modal keyboard** | [032](features/032-frontend-weight-modal-keyboard/README.md) | FE **032** done. |
| **Money UI 2 decimals** | [033](features/033-frontend-money-display-2dp/README.md) | FE **033** done. |
| **Search focus lock** | [034](features/034-frontend-search-focus-lock/README.md) | FE **034** done. |
| **Search typeahead** | [035](features/035-frontend-search-typeahead/README.md) | FE **035** done. |
| **Pay redesign / Print and pay** | [036](features/036-frontend-pay-modal-redesign/README.md) | FE **036** done. |
| **Assign customer on sell screen** | [037](features/037-frontend-assign-customer-sell-screen/README.md) | FE **037** done. |
| **Cart line chrome** | [038](features/038-frontend-cart-line-chrome/README.md) | FE **038** done. |
| **Footer totals Total only** | [039](features/039-frontend-footer-totals-total-only/README.md) | FE **039** done. |
| **Global discount footer button** | [040](features/040-frontend-global-discount-footer-button/README.md) | FE **040** done. |
| **Pay modal layout polish** | [041](features/041-frontend-pay-modal-layout-polish/README.md) | FE **041** done. |
| **Product stock + inventory flag (API)** | [042](features/042-backend-product-stock-inventory-flag/README.md) | BE **042** done. |
| **Cart Stock column** | [043](features/043-frontend-cart-stock-column/README.md) | FE **043** done. |
| **Cart header column alignment** | [044](features/044-frontend-cart-header-column-alignment/README.md) | FE **044** done. |
| **Store preferences / UI locale** | [045](features/045-backend-store-preferences/README.md), [046](features/046-frontend-ui-locale/README.md) | BE **045** + FE **046** done — DB `preferences` + EN/ES UI. |
| **Pay three amount fields** | [047](features/047-frontend-pay-three-amount-fields/README.md) | FE **047** done — CASH/CARD/CREDIT fields; no Add tender. |
| **UI locale coverage polish** | [048](features/048-frontend-ui-locale-coverage/README.md) | FE **048** done — Customer popup, New Ticket, Stock→Inv. |
| **UI locale remaining chrome** | [049](features/049-frontend-ui-locale-remaining-chrome/README.md) | FE **049** done — Pay/shift/drawer/weight/tickets/gates EN/ES. |
| **Product create/update** | [050](features/050-backend-product-create-update/README.md) | BE **050** Done — catalog fields, margin hierarchy, parent package. |
| **Categories CRUD** | [051](features/051-backend-categories-crud/README.md) | BE **051** Done. |
| **Parent stock on sale** | [052](features/052-backend-parent-stock-deduction/README.md) | BE **052** Done — after 050. |
| **Product/category admin UI** | [053](features/053-frontend-product-category-admin/README.md) | FE **053** Done — modal Catalog; forms reused by **054–056**. |
| **POS workspace nav shell** | [054](features/054-frontend-workspace-nav-shell/README.md) | FE **054** Done — row under header; Sell + placeholders. |
| **Products workspace** | [055](features/055-frontend-products-workspace/README.md) | FE **055** Done — Product\|Category tabs; remove Catalog modal. |
| **Product lookup load-or-create** | [056](features/056-frontend-product-lookup-load-or-create/README.md) | FE **056** Done — scan/type → edit or create prefill. |
| **Product lookup keyboard + load** | [057](features/057-frontend-product-lookup-keyboard-and-load/README.md) | FE **057** Done — arrow keys + abort-safe editor. |
| **Workspace nav labels** | [058](features/058-frontend-workspace-nav-labels/README.md) | FE **058** Done — Register / Customers copy. |

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
| 024 | FE | Done | [README](features/024-frontend-shift-discrepancy-ticket/README.md) | [spec](features/024-frontend-shift-discrepancy-ticket/spec.md) · [plan](features/024-frontend-shift-discrepancy-ticket/plan.md) · [tasks](features/024-frontend-shift-discrepancy-ticket/tasks.md) |
| 025 | BE | Done | [README](features/025-backend-auth-v1/README.md) | [spec](features/025-backend-auth-v1/spec.md) · [plan](features/025-backend-auth-v1/plan.md) · [tasks](features/025-backend-auth-v1/tasks.md) |
| 026 | FE | Done | [README](features/026-frontend-auth-v1/README.md) | [spec](features/026-frontend-auth-v1/spec.md) · [plan](features/026-frontend-auth-v1/plan.md) · [tasks](features/026-frontend-auth-v1/tasks.md) |
| 027 | BE | Done | [README](features/027-backend-multi-sku/README.md) | [spec](features/027-backend-multi-sku/spec.md) · [plan](features/027-backend-multi-sku/plan.md) · [tasks](features/027-backend-multi-sku/tasks.md) |
| 028 | FE | Done | [README](features/028-frontend-multi-sku/README.md) | [spec](features/028-frontend-multi-sku/spec.md) · [plan](features/028-frontend-multi-sku/plan.md) · [tasks](features/028-frontend-multi-sku/tasks.md) |
| 029 | BE | Done | [README](features/029-backend-expected-cash-tenders/README.md) | [spec](features/029-backend-expected-cash-tenders/spec.md) · [plan](features/029-backend-expected-cash-tenders/plan.md) · [tasks](features/029-backend-expected-cash-tenders/tasks.md) |
| 030 | FE | Done | [README](features/030-frontend-shift-close-ticket-tenders/README.md) | [spec](features/030-frontend-shift-close-ticket-tenders/spec.md) · [plan](features/030-frontend-shift-close-ticket-tenders/plan.md) · [tasks](features/030-frontend-shift-close-ticket-tenders/tasks.md) |
| 031 | FE | Done | [README](features/031-frontend-cash-drawer-pay-in-out/README.md) | [spec](features/031-frontend-cash-drawer-pay-in-out/spec.md) · [plan](features/031-frontend-cash-drawer-pay-in-out/plan.md) · [tasks](features/031-frontend-cash-drawer-pay-in-out/tasks.md) |
| 032 | FE | Done | [README](features/032-frontend-weight-modal-keyboard/README.md) | [spec](features/032-frontend-weight-modal-keyboard/spec.md) · [plan](features/032-frontend-weight-modal-keyboard/plan.md) · [tasks](features/032-frontend-weight-modal-keyboard/tasks.md) |
| 033 | FE | Done | [README](features/033-frontend-money-display-2dp/README.md) | [spec](features/033-frontend-money-display-2dp/spec.md) · [plan](features/033-frontend-money-display-2dp/plan.md) · [tasks](features/033-frontend-money-display-2dp/tasks.md) |
| 034 | FE | Done | [README](features/034-frontend-search-focus-lock/README.md) | [spec](features/034-frontend-search-focus-lock/spec.md) · [plan](features/034-frontend-search-focus-lock/plan.md) · [tasks](features/034-frontend-search-focus-lock/tasks.md) |
| 035 | FE | Done | [README](features/035-frontend-search-typeahead/README.md) | [spec](features/035-frontend-search-typeahead/spec.md) · [plan](features/035-frontend-search-typeahead/plan.md) · [tasks](features/035-frontend-search-typeahead/tasks.md) |
| 036 | FE | Done | [README](features/036-frontend-pay-modal-redesign/README.md) | [spec](features/036-frontend-pay-modal-redesign/spec.md) · [plan](features/036-frontend-pay-modal-redesign/plan.md) · [tasks](features/036-frontend-pay-modal-redesign/tasks.md) |
| 037 | FE | Done | [README](features/037-frontend-assign-customer-sell-screen/README.md) | [spec](features/037-frontend-assign-customer-sell-screen/spec.md) · [plan](features/037-frontend-assign-customer-sell-screen/plan.md) · [tasks](features/037-frontend-assign-customer-sell-screen/tasks.md) |
| 038 | FE | Done | [README](features/038-frontend-cart-line-chrome/README.md) | [spec](features/038-frontend-cart-line-chrome/spec.md) · [plan](features/038-frontend-cart-line-chrome/plan.md) · [tasks](features/038-frontend-cart-line-chrome/tasks.md) |
| 039 | FE | Done | [README](features/039-frontend-footer-totals-total-only/README.md) | [spec](features/039-frontend-footer-totals-total-only/spec.md) · [plan](features/039-frontend-footer-totals-total-only/plan.md) · [tasks](features/039-frontend-footer-totals-total-only/tasks.md) |
| 040 | FE | Done | [README](features/040-frontend-global-discount-footer-button/README.md) | [spec](features/040-frontend-global-discount-footer-button/spec.md) · [plan](features/040-frontend-global-discount-footer-button/plan.md) · [tasks](features/040-frontend-global-discount-footer-button/tasks.md) |
| 041 | FE | Done | [README](features/041-frontend-pay-modal-layout-polish/README.md) | [spec](features/041-frontend-pay-modal-layout-polish/spec.md) · [plan](features/041-frontend-pay-modal-layout-polish/plan.md) · [tasks](features/041-frontend-pay-modal-layout-polish/tasks.md) |
| 042 | BE | Done | [README](features/042-backend-product-stock-inventory-flag/README.md) | [spec](features/042-backend-product-stock-inventory-flag/spec.md) · [plan](features/042-backend-product-stock-inventory-flag/plan.md) · [tasks](features/042-backend-product-stock-inventory-flag/tasks.md) |
| 043 | FE | Done | [README](features/043-frontend-cart-stock-column/README.md) | [spec](features/043-frontend-cart-stock-column/spec.md) · [plan](features/043-frontend-cart-stock-column/plan.md) · [tasks](features/043-frontend-cart-stock-column/tasks.md) |
| 044 | FE | Done | [README](features/044-frontend-cart-header-column-alignment/README.md) | [spec](features/044-frontend-cart-header-column-alignment/spec.md) · [plan](features/044-frontend-cart-header-column-alignment/plan.md) · [tasks](features/044-frontend-cart-header-column-alignment/tasks.md) |
| 045 | BE | Done | [README](features/045-backend-store-preferences/README.md) | [spec](features/045-backend-store-preferences/spec.md) · [plan](features/045-backend-store-preferences/plan.md) · [tasks](features/045-backend-store-preferences/tasks.md) |
| 046 | FE | Done | [README](features/046-frontend-ui-locale/README.md) | [spec](features/046-frontend-ui-locale/spec.md) · [plan](features/046-frontend-ui-locale/plan.md) · [tasks](features/046-frontend-ui-locale/tasks.md) |
| 047 | FE | Done | [README](features/047-frontend-pay-three-amount-fields/README.md) | [spec](features/047-frontend-pay-three-amount-fields/spec.md) · [plan](features/047-frontend-pay-three-amount-fields/plan.md) · [tasks](features/047-frontend-pay-three-amount-fields/tasks.md) |
| 048 | FE | Done | [README](features/048-frontend-ui-locale-coverage/README.md) | [spec](features/048-frontend-ui-locale-coverage/spec.md) · [plan](features/048-frontend-ui-locale-coverage/plan.md) · [tasks](features/048-frontend-ui-locale-coverage/tasks.md) |
| 049 | FE | Done | [README](features/049-frontend-ui-locale-remaining-chrome/README.md) | [spec](features/049-frontend-ui-locale-remaining-chrome/spec.md) · [plan](features/049-frontend-ui-locale-remaining-chrome/plan.md) · [tasks](features/049-frontend-ui-locale-remaining-chrome/tasks.md) |
| 050 | BE | Done | [README](features/050-backend-product-create-update/README.md) | [spec](features/050-backend-product-create-update/spec.md) · [plan](features/050-backend-product-create-update/plan.md) · [tasks](features/050-backend-product-create-update/tasks.md) |
| 051 | BE | Done | [README](features/051-backend-categories-crud/README.md) | [spec](features/051-backend-categories-crud/spec.md) · [plan](features/051-backend-categories-crud/plan.md) · [tasks](features/051-backend-categories-crud/tasks.md) |
| 052 | BE | Done | [README](features/052-backend-parent-stock-deduction/README.md) | [spec](features/052-backend-parent-stock-deduction/spec.md) · [plan](features/052-backend-parent-stock-deduction/plan.md) · [tasks](features/052-backend-parent-stock-deduction/tasks.md) |
| 053 | FE | Done (modal; nav UX → **054–056**) | [README](features/053-frontend-product-category-admin/README.md) | [spec](features/053-frontend-product-category-admin/spec.md) · [plan](features/053-frontend-product-category-admin/plan.md) · [tasks](features/053-frontend-product-category-admin/tasks.md) |
| 054 | FE | Done | [README](features/054-frontend-workspace-nav-shell/README.md) | [spec](features/054-frontend-workspace-nav-shell/spec.md) · [plan](features/054-frontend-workspace-nav-shell/plan.md) · [tasks](features/054-frontend-workspace-nav-shell/tasks.md) |
| 055 | FE | Done | [README](features/055-frontend-products-workspace/README.md) | [spec](features/055-frontend-products-workspace/spec.md) · [plan](features/055-frontend-products-workspace/plan.md) · [tasks](features/055-frontend-products-workspace/tasks.md) |
| 056 | FE | Done | [README](features/056-frontend-product-lookup-load-or-create/README.md) | [spec](features/056-frontend-product-lookup-load-or-create/spec.md) · [plan](features/056-frontend-product-lookup-load-or-create/plan.md) · [tasks](features/056-frontend-product-lookup-load-or-create/tasks.md) |
| 057 | FE | Done | [README](features/057-frontend-product-lookup-keyboard-and-load/README.md) | [spec](features/057-frontend-product-lookup-keyboard-and-load/spec.md) · [plan](features/057-frontend-product-lookup-keyboard-and-load/plan.md) · [tasks](features/057-frontend-product-lookup-keyboard-and-load/tasks.md) |
| 058 | FE | Done | [README](features/058-frontend-workspace-nav-labels/README.md) | [spec](features/058-frontend-workspace-nav-labels/spec.md) · [plan](features/058-frontend-workspace-nav-labels/plan.md) · [tasks](features/058-frontend-workspace-nav-labels/tasks.md) |
| 059 | BE | Done | [README](features/059-backend-product-target-margin-backfill/README.md) | [spec](features/059-backend-product-target-margin-backfill/spec.md) · [plan](features/059-backend-product-target-margin-backfill/plan.md) · [tasks](features/059-backend-product-target-margin-backfill/tasks.md) |
| 060 | BE | Done | [README](features/060-backend-customer-identity-update/README.md) | [spec](features/060-backend-customer-identity-update/spec.md) · [plan](features/060-backend-customer-identity-update/plan.md) · [tasks](features/060-backend-customer-identity-update/tasks.md) |
| 061 | FE | Done | [README](features/061-frontend-customers-workspace/README.md) | [spec](features/061-frontend-customers-workspace/spec.md) · [plan](features/061-frontend-customers-workspace/plan.md) · [tasks](features/061-frontend-customers-workspace/tasks.md) |
| 062 | BE | Done | [README](features/062-backend-inventory-movements/README.md) | [spec](features/062-backend-inventory-movements/spec.md) · [plan](features/062-backend-inventory-movements/plan.md) · [tasks](features/062-backend-inventory-movements/tasks.md) |
| 063 | FE | Done | [README](features/063-frontend-inventory-workspace/README.md) | [spec](features/063-frontend-inventory-workspace/spec.md) · [plan](features/063-frontend-inventory-workspace/plan.md) · [tasks](features/063-frontend-inventory-workspace/tasks.md) |
| 064 | FE | Done | [README](features/064-frontend-uset-stable-loading/README.md) | [spec](features/064-frontend-uset-stable-loading/spec.md) · [plan](features/064-frontend-uset-stable-loading/plan.md) · [tasks](features/064-frontend-uset-stable-loading/tasks.md) |
| 065 | FE | Done | [README](features/065-frontend-login-friendly-error/README.md) | [spec](features/065-frontend-login-friendly-error/spec.md) · [plan](features/065-frontend-login-friendly-error/plan.md) · [tasks](features/065-frontend-login-friendly-error/tasks.md) |
| 066 | FE | Done | [README](features/066-frontend-inventory-receive-price-preview/README.md) | [spec](features/066-frontend-inventory-receive-price-preview/spec.md) · [plan](features/066-frontend-inventory-receive-price-preview/plan.md) · [tasks](features/066-frontend-inventory-receive-price-preview/tasks.md) |
| 067 | BE | Done | [README](features/067-backend-customer-payment-tender/README.md) | [spec](features/067-backend-customer-payment-tender/spec.md) · [plan](features/067-backend-customer-payment-tender/plan.md) · [tasks](features/067-backend-customer-payment-tender/tasks.md) |
| 068 | FE | Done | [README](features/068-frontend-customer-payment-modal/README.md) | [spec](features/068-frontend-customer-payment-modal/spec.md) · [plan](features/068-frontend-customer-payment-modal/plan.md) · [tasks](features/068-frontend-customer-payment-modal/tasks.md) |
| 069 | BE | Done | [README](features/069-backend-credit-ledger-description/README.md) | [spec](features/069-backend-credit-ledger-description/spec.md) · [plan](features/069-backend-credit-ledger-description/plan.md) · [tasks](features/069-backend-credit-ledger-description/tasks.md) |
| 070 | FE | Done | [README](features/070-frontend-credit-ledger-movements/README.md) | [spec](features/070-frontend-credit-ledger-movements/spec.md) · [plan](features/070-frontend-credit-ledger-movements/plan.md) · [tasks](features/070-frontend-credit-ledger-movements/tasks.md) |
| 071 | FE | Done | [README](features/071-frontend-money-display-3dp/README.md) | [spec](features/071-frontend-money-display-3dp/spec.md) · [plan](features/071-frontend-money-display-3dp/plan.md) · [tasks](features/071-frontend-money-display-3dp/tasks.md) |
| 072 | BE | Done | [README](features/072-backend-closed-tickets-reimburse/README.md) | [spec](features/072-backend-closed-tickets-reimburse/spec.md) · [plan](features/072-backend-closed-tickets-reimburse/plan.md) · [tasks](features/072-backend-closed-tickets-reimburse/tasks.md) |
| 073 | FE | Done | [README](features/073-frontend-closed-tickets-reimburse/README.md) | [spec](features/073-frontend-closed-tickets-reimburse/spec.md) · [plan](features/073-frontend-closed-tickets-reimburse/plan.md) · [tasks](features/073-frontend-closed-tickets-reimburse/tasks.md) |
| 074 | FE | Done | [README](features/074-frontend-product-editor-margin-units/README.md) | [spec](features/074-frontend-product-editor-margin-units/spec.md) · [plan](features/074-frontend-product-editor-margin-units/plan.md) · [tasks](features/074-frontend-product-editor-margin-units/tasks.md) |
| 075 | FE | Done | [README](features/075-frontend-customer-has-credit-checkbox/README.md) | [spec](features/075-frontend-customer-has-credit-checkbox/spec.md) · [plan](features/075-frontend-customer-has-credit-checkbox/plan.md) · [tasks](features/075-frontend-customer-has-credit-checkbox/tasks.md) |
| 076 | FE | Done | [README](features/076-frontend-product-editor-category-parent-ux/README.md) | [spec](features/076-frontend-product-editor-category-parent-ux/spec.md) · [plan](features/076-frontend-product-editor-category-parent-ux/plan.md) · [tasks](features/076-frontend-product-editor-category-parent-ux/tasks.md) |

---

## Register UX polish (planned order after Phase A)

Decisions 2026-07-22 + review 2026-07-23. All frontend-only; implement in number order:

1. [032](features/032-frontend-weight-modal-keyboard/README.md) — weight field keyboard ~~(done)~~
2. [033](features/033-frontend-money-display-2dp/README.md) — money display 2 dp ~~(done)~~
3. [034](features/034-frontend-search-focus-lock/README.md) — search focus lock ~~(done)~~
4. [035](features/035-frontend-search-typeahead/README.md) — search typeahead ~~(done)~~
5. [036](features/036-frontend-pay-modal-redesign/README.md) — Pay redesign + Print and pay ~~(done)~~
6. [037](features/037-frontend-assign-customer-sell-screen/README.md) — assign customer from sell screen ~~(done)~~
7. [038](features/038-frontend-cart-line-chrome/README.md) — cart line chrome (hide SKU/unit price; Product/Qty/Discount/Subtotal headers)
8. [039](features/039-frontend-footer-totals-total-only/README.md) — footer totals: Total only
9. [040](features/040-frontend-global-discount-footer-button/README.md) — global discount as footer button
10. [041](features/041-frontend-pay-modal-layout-polish/README.md) — Pay modal layout polish ~~(done)~~
11. [042](features/042-backend-product-stock-inventory-flag/README.md) — BE: ProductDTO stock fields + `enableInventory` on `/me` ~~(done)~~
12. [043](features/043-frontend-cart-stock-column/README.md) — cart Stock column when inventory enabled ~~(done)~~
13. [044](features/044-frontend-cart-header-column-alignment/README.md) — cart header/column alignment ~~(done)~~
14. [047](features/047-frontend-pay-three-amount-fields/README.md) — Pay three amount fields (Option A) ~~(done)~~
15. [048](features/048-frontend-ui-locale-coverage/README.md) — UI locale coverage polish ~~(done)~~
16. [049](features/049-frontend-ui-locale-remaining-chrome/README.md) — UI locale remaining chrome ~~(done)~~

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

Every triad file must include:

```markdown
## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.
```

---

## Maintenance

When you add `docs/features/00N-*/README.md`, add a row to **Feature catalog** and a line under **Topic → where to go** in the same change. Do not leave orphan READMEs without an index entry. Include the **Global rules** section in README, spec, plan, and tasks (see `.cursor/rules/feature-triad-global-rules.mdc`).
