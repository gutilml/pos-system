# Tasks: Feature 007 - Backend Shift & Cash Drawer Management

- [x] 1. Create `Shift` and `CashDrawerEvent` JPA entities with `BigDecimal` fields and Enum statuses.
- [x] 2. Update the existing `Transaction` entity to include a `shift_id` reference.
- [x] 3. Create Repositories for the new entities with a custom query to find the currently `OPEN` shift by store ID.
- [x] 4. Implement `ShiftService` with strict business logic for opening, event handling, and closing/reconciliation calculations.
- [x] 5. Implement `ShiftController` to expose the shift lifecycle via `/api/v1/shifts`.
- [x] 6. Write and pass unit tests for cash calculations and integration tests for shift concurrency constraints.