# Plan: Feature 005 - Backend Modular Inventory & Yield Engine

## Phase 1: The Inventory Service
Create `InventoryService.java` in `src/main/java/com/pos/inventory/services/` (Note the modular folder structure):
* Implement `deductStock(List<TransactionItem> items)`.
* Add logic to check for `parentProductId` and calculate fractional deductions using `BigDecimal.divide(..., 4, RoundingMode.HALF_UP)`.

## Phase 2: Core Integration (Feature Flagging)
Update `TransactionService.java` in the core module:
* Fetch `StoreSettings` for the current tenant/store.
* Evaluate the JSONB feature flag (e.g., `settings.getFeatures().get("enable_inventory").asBoolean()`).
* If true, call `InventoryService.deductStock()`. If false, do nothing.

## Phase 3: Testing Strategy
* Write Unit tests for `InventoryService` explicitly testing the math: 
    * Deducting 1 unit from a 24-pack parent item (should subtract 0.0416).
    * Deducting standard integer amounts.
* Write Integration tests verifying the Feature Flag:
    * Mock a store with `enable_inventory = false` and ensure stock remains unchanged after a transaction.