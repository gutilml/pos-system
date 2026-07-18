# Tasks: Feature 021 - Backend Product Search & Barcode (SKU) Lookup

## Backend Tasks

- [x] 1. Extend `ProductDTO` + `ProductServiceImpl.toDto` with `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts`.
- [x] 2. Add repository methods for exact SKU (active) and limited name/SKU contains search.
- [x] 3. Implement `ProductService.search(String q)` with exact-SKU-first behavior.
- [x] 4. Expose `GET /api/v1/products/search` on `ProductController`.
- [x] 5. Update `ProductControllerTest` / `ProductServiceImplTest` fixtures and add search cases.
- [x] 6. Document in `docs/features/021-backend-product-search/README.md`.
- [x] 7. Mark product search item done in `docs/pending feature/backend.md` (Feature 021).

## Frontend Tasks

- None.

## Test Tasks

- [x] 8. Cover exact SKU, partial name, inactive excluded, blank `q` → `[]`, DTO field presence.
