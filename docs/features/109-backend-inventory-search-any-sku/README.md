# Feature 109 — Backend Inventory Search Any SKU

## Status

**Done** — Inventory product `q` matches any barcode on `product_skus`, not only the primary SKU.

## Summary

`InventoryAdminService.listProducts` previously filtered by `resolvePrimarySku()` only, so secondary barcodes (e.g. Cola `7501000001025`) returned no rows. Filter now checks every SKU code (substring, case-insensitive), same idea as register/product search.

## Key files

- `backend/src/main/java/com/pos/inventory/services/InventoryAdminService.java`
- `backend/src/test/java/com/pos/inventory/services/InventoryAdminServiceTest.java`
