# Feature 021 — Backend Product Search & Barcode (SKU) Lookup

## Status

**Done** — Phase A. Unblocks Feature 022.

## Contract

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/products/search?q={text}` | Exact active SKU first (singleton); else active name/SKU contains (max 25) |
| | | Blank `q` → `[]` |

`ProductDTO` now includes `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts` (additive; list/get/create also return them).
