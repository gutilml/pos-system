# Feature: Backend Product Target Margin Backfill

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Persist a product-level `target_margin` whenever cost and selling price are present and margin is missing. Existing seed/legacy products often have null `target_margin`, so the admin Products editor shows an empty margin field even though cost and price are set.

## User Stories

* As a catalog operator, when I open an existing product that has cost and price, I want margin % filled from those values so I can review pricing without recalculating by hand.
* As a merchant, when I create or update a product with cost and selling price but omit margin, I want the API to store the implied margin for later edits.

## Scope

* **Strictly Backend:** `backend/` pricing + product service, `docs/migrations/`, `docs/seed-data.sql`, feature/pending docs, `docs/README.md`.
* **Depends on:** Feature **050** (`ProductPricing`).
* **Out of scope:** Frontend `effectiveMargin` fallback; DB triggers; changing hierarchy when neither margin nor selling is sent beyond keeping existing selling and backfilling.

## Business rules

1. Formula: `target_margin = 1 - (cost_price / selling_price)` via `ProductPricing.marginFromCostAndPrice` (scale 4, HALF_UP).
2. Backfill only when `target_margin` is null, `cost_price > 0`, `selling_price > 0`, and `cost_price <= selling_price`.
3. Apply on every product create/update after pricing resolution (including hierarchy-computed selling).
4. Do not mutate margin on GET/search; one-time SQL migration + seed fix existing rows.
5. If an explicit `targetMargin` is already set (request or entity), leave it unchanged.

## Acceptance Criteria

1. [x] Create with cost + selling and no `targetMargin` returns/stores derived margin.
2. [x] Update of legacy row with null margin and existing cost/selling persists derived margin.
3. [x] Hierarchy create (cost + category margin) stores realized margin on the product.
4. [x] Migration SQL and seed include `target_margin` for demo products.
5. [x] JUnit coverage for helper + service paths; pending + catalog updated.
