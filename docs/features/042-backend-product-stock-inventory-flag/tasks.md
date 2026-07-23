# Task Checklist — Feature 042 Backend Product Stock + Store Inventory Flag

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- [x] 1. Add `trackInventory` and `currentStock` to `ProductDTO`; map in `ProductServiceImpl.toDto`.
- [x] 2. Add `enableInventory` to `UserResponseDTO`; map from `store.features["enable_inventory"]` in `AuthService.toResponse`.
- [x] 3. Update all Java call sites / fixtures that construct `ProductDTO` or `UserResponseDTO`.
- [x] 4. Extend `ProductControllerTest` / `ProductServiceImplTest` for stock fields on search/list.
- [x] 5. Extend `AuthServiceTest` / `AuthSecurityIntegrationTest` for `enableInventory` true, false, and missing flag.
- [x] 6. Mark pending backend item triad path; update `docs/README.md` catalog/topic; set README status Done when shipped.

## Frontend Tasks

- None (Feature 043).

## Test Tasks

- [x] 7. `./mvnw test` green for product + auth suites covering the new fields.
