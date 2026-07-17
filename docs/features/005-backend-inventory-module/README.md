# Feature 005: Backend Modular Inventory & Yield Engine

## Purpose

Opt-in inventory module that deducts stock after a successful checkout. Core checkout stays fast when `enable_inventory` is false.

## Package layout

| Layer | Package |
| --- | --- |
| Inventory services | `com.pos.inventory.services` |
| Core hook | `com.pos.core.services.TransactionServiceImpl` |

## Feature flag

After a transaction is saved, inventory runs only when:

```text
store.features["enable_inventory"] == true
```

If the store is missing, the flag is absent, or the flag is `false`, `InventoryService` is never called.

## Deduction rules

All math uses `BigDecimal` with scale **4** and `RoundingMode.HALF_UP`.

| Case | Behavior |
| --- | --- |
| Individual unit (`isIndividualUnit` + parent + `unitsPerPackage`) | Deduct `quantity × (1 / unitsPerPackage)` from **parent** `currentStock` |
| Standard / weight-based | Deduct sold `quantity` from the product's own `currentStock` |

Example: selling 1 can from a 24-pack → parent loses `0.0417` (`1/24` HALF_UP).

## Tests

```bash
cd backend
./mvnw test
```

- `InventoryServiceImplTest` — fractional yield + weight/standard deductions
- `TransactionInventoryIntegrationTest` — flag on/off bypass behavior
