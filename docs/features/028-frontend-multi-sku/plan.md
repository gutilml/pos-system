# Implementation Plan - Frontend Multi SKU / Barcode Consumption

## Backend Architecture

None. Consumes Feature 027.

## Frontend Architecture

### API — `frontend/src/api/products.ts`

* Extend `ProductApi` with `skus?: string[]`, `primarySku?: string | null`, `sku?: string | null`.
* `toCartProduct`: `sku: dto.primarySku ?? dto.sku ?? ''`.

### Cart / UI

* Keep `CartProduct.sku` / `CartItem.sku` as `string` (may be empty).
* Adjust `CartItemRow` display if empty sku produces a leading ` · ` — show price only or name-led secondary text.

### Tests

* Update `products.test.ts` and any fixtures assuming required non-empty `sku`.
* Optional SearchBar test with multi-code DTO shape.

## Additional Considerations

* Admin SKU list UI deferred until a product admin surface exists; backend `PUT …/skus` is the contract.
* Ship immediately after 027 to avoid a broken register (nullable/missing top-level `sku`).
