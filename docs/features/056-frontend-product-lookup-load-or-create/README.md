# Feature 056 — Frontend Product Lookup Load-or-Create

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Product tab lookup-first: scan/type finds edit or starts create with barcode/name prefill.

## Behavior

* Product tab lookup submits on Enter / Find.
* Found → edit; not found → create with `looksLikeBarcode` (digit-only length ≥ 4) prefilling barcodes else name.
* Exact SKU preferred via `pickBestProductMatch`; else first hit.
* Save/Cancel returns to lookup.

## Key files

* `frontend/src/features/admin/ProductsWorkspace.tsx`
* `frontend/src/features/admin/ProductEditorForm.tsx`
* `frontend/src/lib/productPricing.ts` (`looksLikeBarcode`, `pickBestProductMatch`)
