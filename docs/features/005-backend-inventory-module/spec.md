# Specification: Feature 005 - Backend Modular Inventory & Yield Engine

## Objective
Implement the opt-in inventory tracking module. This engine must handle precise decimal deductions for fractional/bulk items and automatically calculate parent-package yield deductions when an individual child item is sold.

## Scope
* **Strictly Backend:** No frontend code. 
* **Feature Toggle:** The inventory deduction logic must ONLY execute if the transaction's associated `StoreSettings` has `enable_inventory` set to true. If false, the system bypasses inventory checks entirely to preserve checkout speed.
* **Event/Service Hook:** Integrate this logic into the post-transaction flow (e.g., after a transaction is successfully saved).

## Business Rules
* **Decimal Precision:** All stock adjustments must use `BigDecimal`. 
* **Parent/Child Yield Calculation:** If a sold product has `isIndividualUnit = true` and a valid `parentProductId`, the system must deduct `(1.0000 / unitsPerPackage)` from the parent product's `currentStock`.
* **Standard Deduction:** If a product is sold by weight (e.g., 250g of deli meat), deduct exactly that quantity from the product's `currentStock`.