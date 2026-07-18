# Specification: Feature 022 - Frontend Live Product Catalog

## Objective
Replace the register’s `mockProducts` catalog with live product search/barcode lookup so scanned SKUs and typed names resolve from the backend.

## Scope
* **Strictly Frontend:** Only `frontend/` changes.
* **Depends on:** Feature 021 `GET /api/v1/products/search` (and expanded `ProductDTO`).
* **Out of scope:** Product admin CRUD UI, offline catalog cache, store settings tax rate.

## UX & Business Rules
* `SearchBar` remains scanner-first: Enter submits query; autofocus preserved.
* On submit: call live search; if exactly one product (typical barcode hit), add to cart; if multiple, prefer exact SKU match client-side or add first exact SKU — match backend exact-first contract (usually one result).
* Map API product → `CartProduct` (`id`, `sku`, `name`, `sellingPrice`, `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts`).
* Weight items still open `WeightModal` via existing `addItem` behavior.
* Remove production dependency on `findMockProduct` / `MOCK_PRODUCTS` (tests may keep fixtures).
* Show clear “No product found” / API error messages.

## Acceptance Criteria
1. [x] `SearchBar` no longer imports mock catalog for production lookup.
2. [x] Thin `api/products.ts` (or equivalent) calls `/api/v1/products/search?q=`.
3. [x] Successful barcode/SKU scan adds the live product to the cart with correct price and flags.
4. [x] Weight and exclude-from-global flags from API drive existing UI behavior.
5. [x] Vitest covers mapping + SearchBar success/not-found/error paths.
