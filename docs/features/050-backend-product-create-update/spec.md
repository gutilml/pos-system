# Feature: Backend Product Create/Update Catalog Fields

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Ship a complete product write API: enhance `POST /api/v1/products` and add `PUT`/`PATCH /api/v1/products/{id}` (plus soft deactivate via `isActive`) covering the agreed catalog form. Support optional barcodes, unit vs bulk sell mode, optional parent product link with parent package completeness rules, cost/margin/retail/wholesale pricing, and inventory fields only when the store has inventory enabled.

## User Stories

* As a catalog operator, I want to create and update products with barcodes, pricing, and sell mode so the register catalog stays accurate.
* As a merchant, I want margin defaults from store → category → product, with price and margin staying in sync when either changes.
* As a merchant selling bulk from a parent package, I want child cost derived from the parent and parent package unit/qty required before linking.
* As a merchant without inventory, I do not want inventory fields forced on products.

## Scope

* **Strictly Backend:** `backend/`, `docs/database-schema.sql` (+ seed notes), feature/pending docs, `docs/README.md`.
* **Depends on:** Features 003, 027, 042, 045; categories entity (CRUD public API in **051** — may accept existing category IDs before 051 ships).
* **Out of scope:** Frontend admin UI (**053**); deducting parent stock on sale (**052**); multi-org margin tables; cashier vs admin permission split.

## Fields & business rules

### Identity & codes

* Name required; description optional.
* Barcodes via `product_skus`: **zero or more** allowed (Feature 027).

### Sell mode

* **Unit** — `sellByWeight = false`.
* **Bulk** — `sellByWeight = true` + sell `unitOfMeasure` (e.g. `gr`, `kg`) for scale.
* Optional `parentProductId` when product is sold from a parent package.

### Parent package (on **parent** only)

* `packageUnit` + `qtyPerPackage` (reuse/clarify `unit_of_measure` / `units_per_package` on parent; document naming in DTO).
* Optional for normal unit products; **required on parent** when any child links to it (or when saving a link and parent lacks them → API returns a structured error the UI can turn into a “complete parent package” popup in **053**).
* Children do **not** store `qtyPerPackage`.

### Pricing

* `costPrice` required for margin math when deriving retail.
* **Margin hierarchy (effective margin):** first non-null of  
  `product.targetMargin` → `category.targetMargin` → `store.preferences.default_margin` → (future org).  
  Store key under Feature 045 preferences (e.g. `default_margin` as fraction 0–1).
* **Bidirectional:** given cost, `sellingPrice = cost / (1 − margin)`; given cost + sellingPrice, `margin = 1 − (cost / sellingPrice)` (guard cost &gt; 0, price &gt; cost constraints as business rules).
* `wholesalePrice` optional; may be `0`.
* Persist `targetMargin` on product when overridden; expose effective margin on DTO for clients.

### Child cost from parent (derive, prefer live or refresh-on-parent-change)

* Same package unit: `childCostPerSellUnit = parent.cost / parent.qtyPerPackage`.
* Parent unit `kg`, child sell unit `gr`: `(parent.cost / parent.qtyPerPackage) / 1000` (and analogous conversions for documented unit pairs).
* When parent cost / qty / unit changes, refresh linked children’s `costPrice` (and optionally re-derive selling price if product uses margin-based pricing).

### Inventory

* If store `enable_inventory` is false: ignore/reject setting `trackInventory`/`currentStock`/`lowStockThreshold` as “in use” (or no-op and omit from required validation); do not require them.
* If true: allow `trackInventory`; when true, accept `currentStock` and `lowStockThreshold` (minimum stock).

### Status

* Soft deactivate via `isActive` on update.

## Acceptance Criteria

1. [ ] Schema/DTO expose wholesale, product target margin, parent package unit/qty (or clear mapping of existing columns), low stock on write path; docs updated.
2. [ ] `PUT`/`PATCH /api/v1/products/{id}` updates catalog fields; create path accepts the same field set.
3. [ ] Zero barcodes allowed; bulk requires sell UoM; linking to incomplete parent returns actionable error.
4. [ ] Effective margin follows store → category → product; price ↔ margin stay consistent on write.
5. [ ] Child cost derived from parent with unit conversion rules; parent change refreshes children.
6. [ ] Inventory fields only applied when store inventory enabled.
7. [ ] Wholesale optional / zero allowed.
8. [ ] JUnit covers create/update, margin math both directions, parent package validation, child cost derivation, inventory gating.
9. [ ] Pending + `docs/README.md` updated; 051–053 referenced.
