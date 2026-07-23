# Feature 038 — Frontend Cart Line Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Sell list headers: **Product · Qty · Discount · Subtotal** (Stock deferred to Feature 043).
* Rows hide SKU and unit-price chrome; Item % lives in the Discount column.
* `No Global %` badge stays with the product name.

## Key files

* `CartItemRow.tsx` (`CartListHeader`, shared grid)
* `RegisterScreen.tsx`
