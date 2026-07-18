# Specification: Feature 021 - Backend Product Search & Barcode (SKU) Lookup

## Objective
Add a fast product lookup API for the register: resolve scanned barcodes via exact SKU match and support name/SKU text search for typed queries, returning register-ready product fields.

## Scope
* **Strictly Backend:** No frontend code.
* **Module:** `com.pos.core` products (extends Feature 003).
* **Out of scope:** Product update/deactivate admin APIs, categories CRUD, inventory admin.

## Business Rules & Technical Constraints
* Primary endpoint: `GET /api/v1/products/search?q={text}`.
* **Barcode / scan path:** if an **active** product has `sku` equal to `q` (trim, case-insensitive), return that product as the sole result (or a dedicated exact-match preference before fuzzy name search).
* **Typed search:** otherwise return active products whose `name` or `sku` contains `q` (case-insensitive), capped (e.g. 25).
* Blank `q` → empty list (200).
* Extend `ProductDTO` (and mapper in `ProductServiceImpl`) so the register can build a cart line without guessing:
  * Keep existing fields.
  * Add at least: `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts` (entity already has these; DTO today omits them — required for Features 006/016 live wire-up).
* SKU remains the barcode identifier (no separate barcode column in schema).
* Opt-in inventory flags are not required for search; do not couple search to inventory module.

## Acceptance Criteria
1. [ ] `GET /api/v1/products/search?q=` returns 200 and a JSON array.
2. [ ] Exact active SKU match returns that product (preferentially / solely).
3. [ ] Partial name/SKU search returns matching active products only.
4. [ ] `ProductDTO` includes `sellByWeight`, `unitOfMeasure`, `excludeFromGlobalDiscounts` on search (and ideally list/get for consistency).
5. [ ] Existing `GET /products`, `GET /products/{id}`, `POST /products` remain backward compatible aside from additive DTO fields.
6. [ ] Controller + service tests cover exact SKU, partial name, inactive exclusion, blank query.
