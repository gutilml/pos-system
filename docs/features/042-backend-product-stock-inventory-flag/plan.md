# Implementation Plan - Backend Product Stock + Store Inventory Flag for SPA

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

### `ProductDTO`

* Extend the record with `Boolean trackInventory` and `BigDecimal currentStock` (order: append after existing fields to minimize churn, or place near other register flags — document final order in README).
* Update `ProductServiceImpl.toDto`:
  * `trackInventory` → `Boolean.TRUE.equals(product.getTrackInventory())`
  * `currentStock` → `product.getCurrentStock()` (ensure non-null; if null, `BigDecimal.ZERO.setScale(4)`)

### Auth / `UserResponseDTO`

* Add `boolean enableInventory` to the record.
* In `AuthService.toResponse(User user)`:
  * Load store features map; `enableInventory = store != null && Boolean.TRUE.equals(store.getFeatures().get("enable_inventory"))`.
* Ensure `User` → store association is fetched (already used for `storeId` / `storeName`); if features are lazy JSON, confirm they load under existing `@Transactional(readOnly = true)` on `me` / `login`.

### Controllers

* No signature changes on `ProductController` or `AuthController` — serialization picks up new record components.

### Tests

* `ProductControllerTest.sampleProduct` — pass stock fields; assert `$.[0].currentStock` / `trackInventory` on list/search JSON.
* `ProductServiceImplTest` — create/search fixtures assert mapped stock fields when entities set them.
* `AuthServiceTest` / `AuthSecurityIntegrationTest` — store with `enable_inventory` true/false; assert `$.enableInventory` on `/me` and login.
* Fix every compile break from record arity changes.

## Frontend Architecture

None in this feature. Feature **043** consumes the new fields.

## Additional Considerations

* **Opt-in philosophy:** Returning stock fields when inventory is off is OK; FE must hide Stock UI via `enableInventory`.
* Do not change Feature 005 deduction path.
* FE/BE separation: commit backend-only; no React changes here.
* Document Jackson number shape for `currentStock` (same as other `BigDecimal` money/qty fields on products).
