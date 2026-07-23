# Feature 043 — Frontend Cart Stock Column

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* When `enableInventory` is true on `/me`, cart shows **Stock** between Qty and Discount.
* Display = `currentStock − line quantity` (snapshot at first add); `"—"` if product is not tracked.
* When inventory is off, Stock header and cells are omitted (038 layout unchanged).

## Key files

* `frontend/src/api/auth.ts`, `frontend/src/api/products.ts`
* `frontend/src/types/cart.ts`, `frontend/src/store/useCartStore.ts`
* `frontend/src/components/register/CartItemRow.tsx`
* `frontend/src/features/register/RegisterScreen.tsx`
