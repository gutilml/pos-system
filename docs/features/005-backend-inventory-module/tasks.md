# Tasks: Feature 005 - Backend Modular Inventory & Yield Engine

- [x] 1. Create `InventoryService` with `BigDecimal` deduction logic for standard and weight-based items.
- [x] 2. Implement the parent/child fractional yield deduction logic inside `InventoryService`.
- [x] 3. Update `TransactionService` to conditionally call `InventoryService` based on the `StoreSettings` JSONB feature flag.
- [x] 4. Write JUnit tests verifying the fractional math (e.g., 1/24th of a package).
- [x] 5. Write integration tests verifying the feature flag cleanly bypasses the inventory logic when disabled.
