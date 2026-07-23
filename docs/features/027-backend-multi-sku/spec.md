# Feature: Backend Multi SKU / Barcode (1→N)

## Description

Move scannable catalog codes off the single `products.sku` column into a child table so one product can have many globally unique SKU/barcode values (or none). Update search, create, and DTOs so exact scan and typed lookup work against any linked code, while product identity remains `products.id`.

## User Stories

* As a cashier, I want any linked barcode for a product to resolve to that product so suppliers’ alternate codes still scan.
* As a catalog operator, I want to attach zero or more codes to a product so name-only items (services, open food) and multi-barcode items both work.
* As a developer, I want a replace-list API for a product’s codes so tooling and a future admin UI can manage SKUs without a full product-update feature.

## Scope

* **Strictly Backend:** `backend/`, `docs/database-schema.sql`, `docs/seed-data.sql`, feature/pending docs.
* **Module:** `com.pos.core` products (extends Features 003 / 021).
* **Out of scope:** Pack/parent-child special scan behavior; retired/inactive codes; code ownership audit history; full product update/deactivate API; categories CRUD; frontend (Feature 028).

## Business Rules & Technical Constraints

* Child table `product_skus`:
  * `id` UUID PK
  * `product_id` UUID NOT NULL → `products(id)` ON DELETE CASCADE
  * `code` VARCHAR(100) NOT NULL — scannable value
  * `is_primary` BOOLEAN NOT NULL DEFAULT false
  * `created_at` TIMESTAMPTZ
  * **UNIQUE** on `code` (case-insensitive; trim on write)
  * Index on `product_id`
  * At most one `is_primary = true` per product (service + partial unique index)
* **Remove `products.sku`** after migration. Product identity is `products.id` only.
* **Migration (existing DBs):** for each product, insert one `product_skus` row with `code = old products.sku`, `is_primary = true`, then drop `products.sku` + its unique constraint. Greenfield: update `docs/database-schema.sql` only (no Flyway; `ddl-auto: validate`).
* **Zero codes allowed:** create/update must not require codes; `primarySku` may be null; empty `skus` array is valid.
* **Hard delete:** removing a code deletes the child row; the string is immediately reusable.
* **Search (`GET /api/v1/products/search?q=`):**
  1. Trim; blank → `[]`
  2. Exact match on any active product’s code (case-insensitive) → singleton
  3. Else active products whose **name** or **any code** contains `q` (max 25)
* **`ProductDTO`:** expose `skus: string[]` (primary first when present) and `primarySku: string | null`. Keep top-level `sku` as a **deprecated alias of `primarySku`** for one transition release (nullable when no codes).
* **`ProductRequestDTO`:** drop required `sku`; accept optional `skus: string[]` (first = primary unless `primarySku` provided and present in list). Empty/omitted → no codes.
* **`PUT /api/v1/products/{id}/skus`:** replace entire code list for a product (same validation as create). Body e.g. `{ "skus": ["…"], "primarySku": "…" }` with `primarySku` optional (defaults to first).
* Duplicate codes in one request, empty strings after trim, and global uniqueness conflicts → `400` / business-rule error.

## Acceptance Criteria

1. [ ] `docs/database-schema.sql` defines `product_skus` and no longer requires `products.sku`; JPA entities validate under `ddl-auto: validate`.
2. [ ] Migration notes (README) cover copy-then-drop of legacy `products.sku` for existing databases.
3. [ ] Exact scan of any linked code on an active product returns that product alone.
4. [ ] Typed search matches name or any linked code; inactive products excluded; blank `q` → `[]`.
5. [ ] Products with zero codes are creatable and searchable by name only (never by scan).
6. [ ] `ProductDTO` includes `skus`, `primarySku`, and transitional `sku` alias; create accepts optional `skus` (not required).
7. [ ] `PUT /api/v1/products/{id}/skus` replaces the code list; hard-deletes removed codes; enforces global uniqueness and ≤1 primary.
8. [ ] Seed data inserts codes into `product_skus` (at least one demo product with **two** codes); re-runnable.
9. [ ] JUnit/Mockito (controller/service/repository as appropriate) cover multi-code exact hit, secondary-code exact hit, name-only product, uniqueness conflict, replace-list, blank search.
10. [ ] Pending backend multi-SKU item marked done / noted; `docs/README.md` catalog + topic updated; Feature 028 called out as FE follow-up.
