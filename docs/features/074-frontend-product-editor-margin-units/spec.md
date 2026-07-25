# Feature: Frontend product editor category margin units

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Improve the Products workspace editor so category and cost drive margin/retail live, and packaging unit is chosen from a fixed chip list instead of free text / separate UOM field.

## User Stories

* As a cashier, when I pick a category I want its margin applied automatically.
* As a cashier, when I enter cost I want retail calculated from margin immediately.
* As a cashier, I want to pick package unit from a short list on one row.

## Scope

* **Strictly Frontend:** [`ProductEditorForm.tsx`](../../../frontend/src/features/admin/ProductEditorForm.tsx) (+ i18n, tests, docs).
* **Out of scope:** BE schema for units; Inventory receive pricing (**066** already done).

## UX & business rules

1. **Category → margin:** on category change, set `targetMarginPct` from `category.targetMargin`; if cost present, `sellingPrice = sellingPriceFromMargin(cost, margin)`.
2. **Cost → retail:** on cost change, if margin present, recompute selling (same helper). Selling edit still updates margin (existing).
3. **Remove** Unit of measure text field; do not require `unitOfMeasure` on save (`null`).
4. **Package unit:** single-select chips in one row: `pc` · `kg` · `g` · `lb` · `L` · `ml` (EN/ES labels). Store selected code in `packageUnit`. Hidden when product has parent (unchanged).
5. Sell-by-weight uses the same package-unit chips (e.g. `kg` / `g`); no separate UOM field.
6. Unknown existing `packageUnit` values: show selection empty or “other” cleared until user picks a chip (document in tasks: prefer select matching code case-insensitive, else none).

## Acceptance Criteria

1. [x] Category select populates margin and updates retail when cost set.
2. [x] Cost input updates retail when margin set.
3. [x] UOM field gone; package unit chips single-select; save sends `packageUnit` + `unitOfMeasure: null`.
4. [x] Vitest + EN/ES + pending/catalog when Done.
