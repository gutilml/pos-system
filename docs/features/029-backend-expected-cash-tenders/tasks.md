# Task Checklist — Feature 029 Backend Expected Cash Tenders

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- [x] 1. Add repository query(ies) for payment sums by `shiftId` + `PaymentType` (COMPLETED); `sumChangeGivenByShiftId`; optional COMPLETED `sumGrandTotalByShiftId` for sales summary.
- [x] 2. Change `ShiftServiceImpl.calculateExpectedCash` to use CASH payment sum − change_given + drawer events (not grand totals).
- [x] 3. Extend `ShiftDTO` with `totalCashPayments`, `totalCardPayments`, `totalCreditPayments`, `totalSalesGrandTotal`; populate on close.
- [x] 4. Update Feature 007 README cash-math; write feature README; update `docs/README.md`; mark pending backend expected-cash done / note Feature 030.

## Frontend Tasks

- None.

## Test Tasks

- [x] 5. Rewrite `ShiftServiceImplTest` for CASH vs CARD/CREDIT/split + over-tender/change + pay-in/pay-out; assert CARD/CREDIT excluded from expected.
- [x] 6. Update `ShiftControllerTest` close JSON for new DTO fields; adjust integration coverage if present.
