# Feature: Frontend Cart Header Column Alignment

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Align register cart column headers with their row cells by giving header and row grids identical fixed track sizes (instead of per-grid `auto` columns).

## User Stories

* As a cashier, I want **Qty** labeled directly above the quantity stepper so the cart table is easy to scan.
* As a cashier with inventory on, I want **Stock** / **Discount** / **Subtotal** headers to line up with their values.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature 038 (headers), Feature 043 (optional Stock column).
* **Out of scope:** Seed data / catalog contents; changing column order or discount/stock math.

## Acceptance Criteria

1. [x] Header and row use shared fixed `grid-template-columns` constants (with and without Stock).
2. [x] Qty header is centered over the qty controls; Discount over the % input; Subtotal right-aligned over the amount; Stock right-aligned when shown.
3. [x] Existing CartItemRow Vitest still passes (incl. Stock header order when enabled).
4. [x] Pending frontend + `docs/README.md` catalog updated; triad Done.
