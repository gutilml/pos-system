# Tasks: Feature 012 - Backend Customer Credit (Store Tab) Engine

- [x] 1. Create `Customer` and `CreditLedgerEntry` JPA entities with exact `BigDecimal` fields.
- [x] 2. Update the core `Transaction` entity/DTOs to support `customerId` and `CREDIT` payment type.
- [x] 3. Implement `CustomerCreditService` with strict credit limit validation and ledger logging.
- [x] 4. Create `CustomerController` to expose REST endpoints for customer management and tab payments.
- [x] 5. Write unit tests focusing on exact math, credit limit boundaries, and the feature flag toggle.
- [x] 6. Review `docs/pending_features/backend.md` and update it by crossing out or removing any fulfilled requirements related to customer credit.
