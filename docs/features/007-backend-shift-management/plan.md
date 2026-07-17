# Plan: Feature 007 - Backend Shift & Cash Drawer Management

## Phase 1: Data Layer Updates
* Create `Shift.java` entity in `src/main/java/com/pos/core/models/`.
* Create `CashDrawerEvent.java` entity (e.g., pay-ins, pay-outs) linked to a `Shift`.
* Update the existing `Transaction` entity to include a `@ManyToOne` relationship to `Shift`.
* Create `ShiftRepository` and `CashDrawerEventRepository`.

## Phase 2: Service Layer
* Create `ShiftService.java`:
    * `openShift(storeId, startingCash)`: Fails if an open shift already exists.
    * `closeShift(shiftId, actualCash)`: Calculates the expected cash from all linked transactions and drawer events, updates the discrepancy, and sets status to `CLOSED`.
    * `addDrawerEvent(shiftId, amount, type, reason)`: Records cash manually added or removed from the drawer.

## Phase 3: REST Controllers
* Create `ShiftController.java` with routes:
    * `POST /api/v1/shifts/open`
    * `POST /api/v1/shifts/{id}/close`
    * `POST /api/v1/shifts/{id}/events`

## Phase 4: Testing Strategy
* Write Unit tests for `ShiftService` focusing on the exact `BigDecimal` calculation of expected cash vs actual cash.
* Write Integration tests to verify the one-open-shift-per-store constraint.