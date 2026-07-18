# Tasks: Feature 021 - Backend Product Search & Barcode (SKU) Lookup

## Backend Tasks

- [ ] 1. Extend `ProductDTO` + `ProductServiceImpl.toDto` with `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts`.
- [ ] 2. Add repository methods for exact SKU (active) and limited name/SKU contains search.
- [ ] 3. Implement `ProductService.search(String q)` with exact-SKU-first behavior.
- [ ] 4. Expose `GET /api/v1/products/search` on `ProductController`.
- [ ] 5. Update `ProductControllerTest` / `ProductServiceImplTest` fixtures and add search cases.
- [ ] 6. Document in `docs/features/021-backend-product-search/README.md`.
- [ ] 7. Mark product search item done in `docs/pending feature/backend.md` (Feature 021).

## Frontend Tasks

- None.

## Test Tasks

- [ ] 8. Cover exact SKU, partial name, inactive excluded, blank `q` → `[]`, DTO field presence.
