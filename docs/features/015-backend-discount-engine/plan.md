# Plan: Feature 015 - Backend Discount Engine

## Phase 1: Data Model Updates
* Update `Product.java`: Add `Boolean excludeFromGlobalDiscounts`.
* Update `TransactionItem.java`: Add `itemDiscountPercentage` (BigDecimal) and `originalUnitPrice` (BigDecimal).
* Update `Transaction.java`: Add `globalDiscountPercentage` (BigDecimal) and `totalDiscountAmount` (BigDecimal).

## Phase 2: DTO Updates
* Update `TransactionItemRequestDTO` to accept an optional `itemDiscountPercentage`.
* Update `TransactionRequestDTO` to accept an optional `globalDiscountPercentage`.

## Phase 3: Service Layer Refactor
Refactor `TransactionService.java` pricing math:
* Loop 1 (Line Items): Calculate `finalUnitPrice` = `originalUnitPrice` - (`originalUnitPrice` * `itemDiscountPercentage`).
* Loop 2 (Global): If `globalDiscountPercentage` > 0, iterate through items. If `!product.excludeFromGlobalDiscounts`, apply the global percentage to the *new* `finalUnitPrice` to get the true final price.
* Sum up the `totalDiscountAmount` for the entire transaction to save in the DB.

## Phase 4: Testing & Backlog Grooming
* Write rigorous unit tests in `TransactionServiceTest` simulating:
  * A cart with mixed eligible/excluded items and a global discount.
  * A cart with both item-level and global-level discounts applied to the same item.
* **Grooming:** Read `docs/pending_features/backend.md` and remove/resolve any bullet points mentioning discounts.