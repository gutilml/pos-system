# Implementation Plan - Backend Multi SKU / Barcode (1→N)

## Backend Architecture

### Schema — `docs/database-schema.sql`

1. Add `product_skus` as specified in the spec.
2. Remove `sku` from `products`.
3. Document a one-shot migration SQL block in the feature README for existing Postgres DBs (CREATE → INSERT FROM products → DROP COLUMN).

### Model — `com.pos.core.models`

* New `ProductSku` entity (`product_skus`).
* `Product`: remove `sku` field; add `@OneToMany` (cascade + orphanRemoval) to `ProductSku`, or manage via `ProductSkuRepository` with explicit service logic (prefer clear orphanRemoval on the collection for replace-list).

### Repository

* `ProductSkuRepository`: `findByCodeIgnoreCase`, uniqueness helpers as needed.
* `ProductRepository`: replace `findBySkuIgnoreCaseAndActiveTrue` / name-or-sku JPQL with joins (or subquery) on `ProductSku`:
  * exact active by code
  * search active by name OR any code contains `q`

### DTOs

* `ProductDTO`: add `List<String> skus`, `String primarySku`; keep `String sku` as alias of primary for transition.
* `ProductRequestDTO`: remove `@NotBlank sku`; add `List<String> skus`, optional `String primarySku`.
* New `ProductSkusUpdateDTO` (or reuse request shape) for `PUT …/skus`.

### Service — `ProductService` / `ProductServiceImpl`

* `toDto`: map codes (primary first); set deprecated `sku` = `primarySku`.
* `create`: persist product, then attach codes (allow empty); validate uniqueness + single primary.
* `search`: exact-any-code-first, then contains on name/codes.
* `replaceSkus(productId, …)`: load product, replace collection, save.
* Normalize: trim codes; reject blanks; case-insensitive uniqueness check before insert.

### Controller — `ProductController`

* Keep list/get/search/create.
* Add `PUT /{id}/skus` → `replaceSkus`.
* Ensure `/search` still registered before `/{id}`.

### Seed — `docs/seed-data.sql`

* Stop inserting `products.sku`.
* Insert `product_skus` rows (one primary per seeded product).
* Give one product (e.g. Cola) a second non-primary code for scan demos.
* Update DELETE cleanup to clear `product_skus` (by product id / code list) before deleting products.

### Tests

* Update all fixtures that call `product.setSku(...)` to attach `ProductSku` rows instead.
* Extend `ProductServiceImplTest` / `ProductControllerTest` / repository tests for multi-code + zero-code + PUT skus.
* Touch inventory/transaction tests that construct `Product` with SKU.

## Frontend Architecture

None (Feature 028).

## Additional Considerations

* **Breaking API:** clients that required non-null `sku` must tolerate null/`skus` (register FE ships in 028 immediately after).
* **No Flyway:** schema source of truth remains SQL docs + Hibernate validate; call out README migration for local DBs.
* Pack `parent_product_id` unchanged; no special scan routing.
* Mark pending backend multi-SKU done when shipped; leave “Product update / deactivate” unchecked (full product fields still not updatable — only SKU list via new endpoint).
