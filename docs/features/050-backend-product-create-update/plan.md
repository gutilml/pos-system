# Implementation Plan - Backend Product Create/Update

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

1. **Schema:** Add `wholesale_price`, `target_margin` (nullable) if missing; document parent package fields (`units_per_package`, package unit — may reuse `unit_of_measure` on parent with clear DTO names `packageUnit` / `qtyPerPackage`). Update `docs/database-schema.sql` + seed as needed.
2. **Store default margin:** Read/write `preferences.default_margin` via Feature 045 settings (document key); org deferred.
3. **DTOs:** Extend `ProductDTO` / `ProductRequestDTO` (create + update) with sell mode, parent id, package fields, wholesale, margins, inventory, `isActive`.
4. **Service:** Extract pricing helpers (margin↔price, effective margin resolution, child cost from parent + unit conversion table). Enforce parent completeness when `parentProductId` set. On parent cost/qty/unit update, cascade child cost refresh.
5. **API:** `PUT` or `PATCH /api/v1/products/{id}`; keep `PUT .../skus`. Auth: any authenticated user (permissions later).
6. **Inventory gating:** Resolve store `enable_inventory` from product’s store context or request store id — align with how products are store-scoped today (global catalog vs store); if catalog is global, gate inventory *fields* using the caller’s store from auth.

## Tests

Service/controller tests for rules above; repository tests if new columns.

## Follow-ups

051 categories CRUD; 052 sale-time parent deduction; 053 admin UI popup for incomplete parent.
