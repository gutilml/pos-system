# Implementation Plan - Frontend Product Lookup Load-or-Create

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Use `searchProducts`, `getProduct` (if needed), `createProduct`, `updateProduct` from `frontend/src/api/products.ts`.

## Frontend Architecture

### Helper

* Add `looksLikeBarcode(raw: string): boolean` (e.g. `frontend/src/lib/looksLikeBarcode.ts`):
  * `const q = raw.trim(); return q.length >= 4 && /^[0-9]+$/.test(q)`
* Unit-test edge cases: empty, short digits, letters, mixed, long UPC-like digits.

### Product tab flow

* Replace list-first Product admin panel with:
  1. Lookup input + submit
  2. Loading / error states
  3. `ProductEditorForm` when editing or creating after lookup
* Match resolution: after `searchProducts`, if any row’s `primarySku` / `sku` / `skus[]` equals trimmed query (case-sensitive as API returns), prefer that row; else use `rows[0]` when `rows.length > 0`.

### `ProductEditorForm`

* Add optional create prefills: `initialName?: string`, `initialSkusText?: string` applied only when `productId == null` on mount/reset.
* Keep cancel/saved callbacks so parent returns to empty lookup.

### i18n

* Keys e.g. `admin.productLookup`, `admin.productLookupHint`, reuse `search.noProduct` or a create-specific “Starting new product” message.

### Tests

* Helper tests for heuristic.
* Component test: mock `searchProducts` → found loads editor with id; not found + barcode prefills skus; not found + name prefills name.

### Docs

* Pending + catalog **056** Done on ship.

## Additional Considerations

* Do not change sell-screen `SearchBar` (still add-to-cart).
* Avoid double-submit while searching.
* FE-only; implement after **055**.
