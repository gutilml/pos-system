# Feature 042 — Backend Product Stock + Store Inventory Flag for SPA

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Behavior

* Expose `currentStock` and `trackInventory` on `ProductDTO` (list / get / search / create responses) so the register can show remaining stock on the cart.
* Expose store `enableInventory` on auth user responses (`GET /api/v1/auth/me` and login body) so the SPA can hide the Stock column when inventory is off.
* Minimal additive DTO change — not a full store-settings CRUD API.

## Key files

* `backend/src/main/java/com/pos/core/dtos/ProductDTO.java`
* `backend/src/main/java/com/pos/core/services/ProductServiceImpl.java` (`toDto`)
* `backend/src/main/java/com/pos/auth/dtos/UserResponseDTO.java`
* `backend/src/main/java/com/pos/auth/services/AuthService.java` (`toResponse`)
* Tests: `ProductControllerTest`, `ProductServiceImplTest`, `AuthSecurityIntegrationTest`, `AuthServiceTest`

## Depends on / follow-ups

* Depends on: Feature 005 (inventory entity fields + `enable_inventory` JSONB), Feature 021 (`ProductDTO` register fields), Feature 025 (`/auth/me`).
* Follow-up FE: Feature **043** Stock column (coordinates with Feature **038** layout).
