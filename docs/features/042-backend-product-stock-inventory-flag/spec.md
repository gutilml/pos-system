# Feature: Backend Product Stock + Store Inventory Flag for SPA

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Give the React register the data it needs for an optional Stock column: product-level `currentStock` / `trackInventory` on `ProductDTO` (including search), and a store-level `enableInventory` boolean on `/auth/me` (and login) derived from `store_settings.features.enable_inventory`. This is a minimal additive API exposure — not inventory admin, not checkout deduction changes (those remain Feature 005).

## User Stories

* As a frontend developer, I want `currentStock` and `trackInventory` on product search results so the cart can compute remaining stock without a second API.
* As a frontend developer, I want `enableInventory` on the authenticated user payload so the SPA can hide the Stock column when the store opts out of inventory.
* As a merchant with inventory off, I want no client dependence on stock fields for layout so the register stays simple (opt-in architecture).

## Scope

* **Strictly Backend:** `backend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature 005 (`products.current_stock`, `products.track_inventory`, `features.enable_inventory`); Feature 021 (`ProductDTO` register fields); Feature 025 (`UserResponseDTO` / `/auth/me`).
* **Out of scope:** Frontend Stock UI (043); cart column headers (038); full store-settings read/update API; inventory adjustments/receiving/admin; changing Feature 005 deduction math; new endpoints solely for stock.

## Business Rules & Technical Constraints

### `ProductDTO` (additive)

* Add:
  * `currentStock` — `BigDecimal`, scale **4**, mapped from `Product.currentStock` (default entity zero is fine).
  * `trackInventory` — `Boolean`, mapped from `Product.trackInventory` (treat null as `false` in DTO for JSON clarity, matching other boolean fields on `ProductDTO`).
* Include on **all** existing mappings via `ProductServiceImpl.toDto` so list, get, search, create, and SKU-replace responses stay consistent.
* JSON property names: camelCase (`currentStock`, `trackInventory`) to match existing DTO style.
* Do **not** gate these fields on `enable_inventory` at the API layer — always return them; the SPA decides visibility from `enableInventory` on `/me`.

### Store flag on auth responses

* Add `enableInventory` (`boolean`) to `UserResponseDTO`.
* Resolve from the user’s linked store: `Boolean.TRUE.equals(store.getFeatures().get("enable_inventory"))`.
* If user has no store, or features map is null/missing key → `false`.
* Populate on both `login` and `me` via `AuthService.toResponse` (same mapper).
* Prefer this over a new `/store/settings` endpoint for Feature 043 (minimal change). Full settings API remains a separate pending item.

### Compatibility

* Additive JSON fields only; no schema migration (columns already exist).
* Update all `new ProductDTO(...)` / `new UserResponseDTO(...)` call sites in tests.

## Acceptance Criteria

1. [x] `ProductDTO` includes `currentStock` (scale-4 decimal) and `trackInventory` on search, list, get, and create responses.
2. [x] `ProductServiceImpl.toDto` maps entity `currentStock` / `trackInventory` correctly (null track → false).
3. [x] `GET /api/v1/auth/me` and login response include `enableInventory` reflecting `store.features.enable_inventory`.
4. [x] Missing/absent `enable_inventory` or null store → `enableInventory: false`.
5. [x] No new public endpoints required for this feature; existing routes only gain fields.
6. [x] JUnit/Mockito (controller + service/auth) tests assert the new fields; existing product/auth tests updated for record constructors.
7. [x] Pending backend items promoted with triad path (keep `[ ]` until shipped); `docs/README.md` catalog/topic updated.
