# Implementation Plan - Backend Expected Cash = CASH Tenders Only

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

### Repository

* Extend `TransactionRepository` (or add `TransactionPaymentRepository`) with:
  * `sumPaymentAmountByShiftIdAndMethod(shiftId, PaymentType)` — `COALESCE(SUM(p.amount), 0)` joined through `Transaction`, filter `paymentMethod` + `status = COMPLETED`.
  * `sumChangeGivenByShiftId(shiftId)` — `COALESCE(SUM(t.changeGiven), 0)` for COMPLETED transactions on the shift.
  * Keep or add `sumGrandTotalByShiftId` (COMPLETED-only) for `totalSalesGrandTotal` on the DTO — **not** used in `expectedCash`.
* Retire use of grand-total sum inside `ShiftServiceImpl.calculateExpectedCash`.

### Service — `ShiftServiceImpl`

* `calculateExpectedCash(shift)`:
  * `startingCash + sum(CASH) − sum(change_given) + pay-ins − pay-outs`.
* `closeShift`:
  * Compute expected / discrepancy as today.
  * Load CASH / CARD / CREDIT payment sums (+ sales grand total).
  * Map into expanded `ShiftDTO`.
* `toDto` for OPEN: summary fields `null`. For CLOSED: values set at close time or recompute from payments when mapping.

### DTO — `ShiftDTO`

Add (after existing cash fields):

* `BigDecimal totalCashPayments` (nullable)
* `BigDecimal totalCardPayments` (nullable)
* `BigDecimal totalCreditPayments` (nullable)
* `BigDecimal totalSalesGrandTotal` (nullable)

Update all test constructors / JSON assertions (`ShiftControllerTest`, `ShiftServiceImplTest`, integration fixtures).

### Controllers

* No new endpoints. `POST /api/v1/shifts/{id}/close` returns richer `ShiftDTO`.
* `GET /api/v1/shifts/current` / open responses: summary fields null.

### Docs

* `docs/features/007-backend-shift-management/README.md` — replace grand-total formula; document change_given netting.
* Feature 029 README + triad; pending + catalog.

## Frontend Architecture

None (Feature 030).

## Additional Considerations

* **Change netting approved (2026-07-22):** subtract shift `change_given` so over-tender does not inflate expected cash.
* **No Flyway / no new `shifts` columns** unless product later wants persisted tender audits for shift history.
* Jackson will serialize new fields; existing FE ignores until 030.
* Refunds / voids: COMPLETED-only filter is enough for now.
