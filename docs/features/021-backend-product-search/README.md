# Feature 021 — Backend Product Search & Barcode (SKU) Lookup

## Status

**Planned** (Phase A). Unblocks Feature 022.

## Intended contract

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/products/search?q={text}` | Exact active SKU first; else name/SKU contains; active only |

Also expands `ProductDTO` with register fields already on `Product` entity but missing from the DTO today.
