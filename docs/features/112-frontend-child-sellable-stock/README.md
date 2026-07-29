# Feature 112 — Child Sellable Stock on Register Ticket

## Status

**Done** — Register Inv for child products shows sellable units from the parent package; sibling lines sharing a parent share one stock pool.

## Summary

- `ProductDTO` adds `stockedProductId` and `availableSellUnits` (parent packages × qtyPerPackage, converted to child sell unit).
- Cart snapshots those fields; Inv display subtracts all ticket qty for the same `stockedProductId`.
- Negative-stock banner uses the same remaining calculation.
- Admin still saves children as `trackInventory: false`.

## Key files

- `backend/src/main/java/com/pos/core/dtos/ProductDTO.java`
- `backend/src/main/java/com/pos/core/services/ProductServiceImpl.java`
- `frontend/src/api/products.ts`
- `frontend/src/types/cart.ts`
- `frontend/src/components/register/CartItemRow.tsx`
- `frontend/src/features/register/RegisterScreen.tsx`
