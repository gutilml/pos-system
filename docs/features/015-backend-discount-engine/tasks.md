# Tasks: Feature 015 - Backend Discount Engine

- [x] 1. Update `Product`, `Transaction`, and `TransactionItem` entities with discount fields and the exclusion flag.
- [x] 2. Update DTOs to accept the new discount request parameters.
- [x] 3. Refactor `TransactionService` to implement the cascading discount math logic.
- [x] 4. Ensure all calculations use `BigDecimal` safely to prevent floating-point loss.
- [x] 5. Write strict unit tests verifying the discount hierarchy and exclusion rules.
- [x] 6. Review `docs/pending_features/backend.md` and update it by crossing out or removing any fulfilled requirements related to discounts.
