# Feature 044 — Frontend Cart Header Column Alignment

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Cart list header and row cells share the same fixed CSS grid track widths so **Qty** sits over the quantity controls, **Stock** (when visible) over the stock value, **Discount** over the item % field, and **Subtotal** over the line total.
* Fixes misalignment from Feature 038/043 where header and rows used separate grids with `auto` tracks that sized independently.

## Key files

* `frontend/src/components/register/CartItemRow.tsx` (`CART_ROW_GRID`, `CART_ROW_GRID_WITH_STOCK`, `CartListHeader`)
* `frontend/src/components/register/CartItemRow.test.tsx`
