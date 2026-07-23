# Task Checklist — Feature 027 Backend Multi SKU

## Backend Tasks

- [x] 1. Update `docs/database-schema.sql`: add `product_skus`, remove `products.sku`; document migration SQL in feature README.
- [x] 2. Add `ProductSku` entity; remove `sku` from `Product`; wire relationship / repository.
- [x] 3. Rewrite `ProductRepository` exact + contains search against codes (active only).
- [x] 4. Update `ProductDTO` / `ProductRequestDTO` / `toDto` / `create` for optional multi-code (zero allowed).
- [x] 5. Implement `replaceSkus` + `PUT /api/v1/products/{id}/skus` on `ProductController`.
- [x] 6. Update `docs/seed-data.sql` for `product_skus` (+ one dual-code demo product).
- [x] 7. Fix all backend tests that set `Product.sku`; add multi-code / zero-code / uniqueness / PUT coverage.
- [x] 8. Write `docs/features/027-backend-multi-sku/README.md`; update `docs/README.md` catalog + topic; mark pending backend multi-SKU done; note Feature 028.

## Frontend Tasks

- None.

## Test Tasks

- [x] 9. Cover: secondary barcode exact hit; name-only product; duplicate code 400; replace-list hard-deletes old codes; blank `q` → `[]`.
