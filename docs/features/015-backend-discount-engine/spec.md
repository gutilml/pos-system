# Specification: Feature 015 - Backend Discount Engine

## Objective
Implement a multi-tiered discount engine capable of processing both item-level and cart-level (global) discounts simultaneously, while respecting product-specific exclusion rules for "special price" items.

## Scope
* **Strictly Backend:** No frontend code.
* **Database Updates:** Update `Product`, `Transaction`, and `TransactionItem` entities to store discount percentages, amounts, and exclusion flags.
* **Backlog Management:** Review and update `docs/pending_features/backend.md` to check off items related to discounts, promotions, or pricing rules.

## Business Rules & Math Constraints
* **Exclusion Flag:** `Product` must have a boolean `exclude_from_global_discounts` (default false).
* **Audit Trail:** `TransactionItem` must store the `original_unit_price`, `item_discount_percentage`, and `final_unit_price`. `Transaction` must store `global_discount_percentage` and `total_discount_amount`.
* **The Cascade Rule:** 
  1. Apply `item_discount_percentage` to the base price first.
  2. If `global_discount_percentage` exists, apply it ONLY to items where `exclude_from_global_discounts` is false.
  3. Global discounts compound *after* the item discount (e.g., 10% global off a discounted $90 item = $81).
* **Precision:** All discount calculations MUST use `BigDecimal` with rounding set to `HALF_UP` at 4 decimal places during calculation, and 2 decimal places for the final DB save.