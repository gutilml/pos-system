# Task Checklist — Feature 028 Frontend Multi SKU

## Backend Tasks

- None. Requires Feature 027.

## Frontend Tasks

- [x] 1. Update `ProductApi` + `toCartProduct` for `skus` / `primarySku` / nullable `sku`.
- [x] 2. Fix cart row display for empty primary SKU.
- [x] 3. Update Vitest fixtures/tests (`products.test.ts`, cart-related as needed).
- [x] 4. Document in `docs/features/028-frontend-multi-sku/README.md`; update `docs/README.md`; mark pending frontend multi-SKU done.

## Test Tasks

- [x] 5. Cover mapping when `primarySku` is set, when `skus` is empty, and SearchBar add still works.
