# Plan: Feature 022 - Frontend Live Product Catalog

## Backend Architecture

None. Uses Feature 021.

## Frontend Architecture

### API — new `frontend/src/api/products.ts`
* `searchProducts(query: string): Promise<ProductApi[]>` → `GET /api/v1/products/search?q=`
* Types mirror backend `ProductDTO` fields needed by the cart.

### Mapper
* `toCartProduct(dto): CartProduct` — coerce `sellingPrice` to number; copy weight/exclusion flags.

### UI — `SearchBar.tsx`
* Replace `findMockProduct` with async search.
* Handle loading/disabled briefly if needed without blocking scanner feel (prefer await on Enter only).
* On zero results → existing error string; on error → alert text.

### Cleanup
* Stop exporting mock catalog from production paths; keep `mockProducts.ts` only if tests still need it, or move fixtures under `src/test/`.

### Tests
* Mock `searchProducts`; assert `addItem` receives mapped product including `excludeFromGlobalDiscounts` / `sellByWeight`.

## Additional Considerations

* Checkout already POSTs `productId` UUIDs — live IDs are required for successful transactions; this feature is a hard blocker for real sales demos.
* Mark “Replace mock catalog” done in pending frontend when shipped.
