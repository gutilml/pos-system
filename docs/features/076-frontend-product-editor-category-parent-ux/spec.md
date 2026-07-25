# Feature: Frontend product editor category, parent & weight UOM UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Improve the Products workspace editor so cashiers can find or create categories without leaving the form, manage child products with a searchable parent picker (derived cost, margin-driven retail, inventory locked off), and successfully save sell-by-weight products by sending a chip-selected `unitOfMeasure` — fixing the Feature 074 regression where the editor always sent `unitOfMeasure: null`.

## User Stories

* As a cashier, I want to search categories and add a missing one inline so I can finish product create without switching to the Category tab.
* As a cashier, I want to search parent products so linking a child is fast in a long catalog.
* As a cashier, when a child has a parent I want retail to follow parent-derived cost and the child’s category/margin so pricing stays consistent when the category changes.
* As a cashier, when a product has a parent I want Track inventory disabled because stock comes from the parent package.
* As a cashier, when Sell by weight is on I want unit chips so save succeeds against BE validation.

## Scope

* **Strictly Frontend:** primarily `ProductEditorForm.tsx`, optional combobox helper, `productPricing.ts`, i18n, Vitest, pending + catalog docs.
* **Reuse:** `createCategory` / `listCategories`, `PACKAGE_UNIT_CODES`, `sellingPriceFromMargin`.
* **Out of scope:** BE validation changes; Category tab redesign; parent-package completeness modal (**053**).

## UX & business rules

### A) Category search + inline add

1. Searchable category list (filter by name, case-insensitive).
2. Last option always **→ Add category ←** on full list and when search yields no matches.
3. Inline create: name + target margin % via `createCategory`.
4. On success: append, select, apply category→margin→retail; stay on product editor.
5. Cancel add returns to picker without changing selection.

### B) Parent / child

1. Parent picker searchable (name; optionally primary SKU).
2. When parent selected: read-only cost preview from parent; category/margin recalculates retail; Track inventory forced off/disabled; `trackInventory: false` in body.
3. Clearing parent restores editable cost and inventory controls.

### C) Weight UOM (Feature 074 fix)

1. When `sellByWeight`, show package-unit chips as sell `unitOfMeasure` (including with parent).
2. Packaging UI only when no parent.
3. Child+parent+weight: prefill from parent `packageUnit`.
4. `buildBody`: send chip when sell-by-weight; else `unitOfMeasure: null`.

## Acceptance Criteria

1. [x] Category picker filters by search; **→ Add category ←** is last on full list and when search has zero matches.
2. [x] Inline create (name + margin) calls `createCategory`, selects the new category, applies margin/retail, does not leave the product editor.
3. [x] Parent picker filters by search; selecting a parent derives read-only cost preview and recalculates retail when category/margin changes.
4. [x] With parent selected, Track inventory is disabled/off and not sent as true.
5. [x] With `sellByWeight` true, unit chips are shown; save payload includes non-blank `unitOfMeasure`; child+parent prefills from parent package unit.
6. [x] Vitest covers A–C happy paths; EN/ES strings added; pending + catalog updated on ship.
