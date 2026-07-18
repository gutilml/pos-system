# Plan: Feature 021 - Backend Product Search & Barcode (SKU) Lookup

## Backend Architecture

### DTO — `ProductDTO`
Add:

* `Boolean sellByWeight`
* `String unitOfMeasure`
* `Boolean excludeFromGlobalDiscounts`

Update `ProductServiceImpl.toDto` and all test fixtures constructing `ProductDTO`.

### Repository — `ProductRepository`
Add queries such as:

* `Optional<Product> findBySkuIgnoreCaseAndActiveTrue(String sku)` (or equivalent `active` field name `isActive` / `active`)
* `@Query` for active products where `LOWER(name) LIKE` or `LOWER(sku) LIKE`, with limit

### Service — `ProductService` / `ProductServiceImpl`
* `List<ProductDTO> search(String query)`:
  1. Trim; blank → empty
  2. Try exact SKU among active → singleton list
  3. Else contains search on name/sku among active

### Controller — `ProductController`
* `GET /search` with `@RequestParam String q`
* Declare `/search` mapping carefully relative to `/{id}` (static `search` path is fine)

## Frontend Architecture

None (Feature 022 consumes this).

## Additional Considerations

* Products are not store-scoped in the current schema — search is global catalog (acceptable for small-store Phase A).
* Additive DTO fields are JSON-compatible for older clients.
* Mark pending “Product search / barcode lookup” done when shipped.
