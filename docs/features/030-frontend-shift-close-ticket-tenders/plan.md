# Implementation Plan - Frontend Shift Close Ticket Tender Totals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None (consume Feature 029).

## Frontend Architecture

### Types — `frontend/src/api/shifts.ts`

Extend `Shift`:

* `totalCardPayments: number | null`
* `totalCreditPayments: number | null`
* `totalCashPayments: number | null`
* `totalSalesGrandTotal: number | null`

### UI — `ShiftCloseTicket.tsx`

* After discrepancy block, add a **Sales summary** section:
  * Cash payments
  * Card total
  * Credit (store tab) total
  * Sales grand total
* Reuse `formatMoney`; `data-testid`s for new rows.
* Keep print styles working for the extra rows.

### Store / modals

* `useShiftStore` / `lastClosedShift` already holds close response — no flow change if DTO is passed through.
* `CloseShiftModal`: no new fields; tests remain “no expected / no card|credit before submit”.

### Tests

* Update fixtures in `ShiftCloseTicket.test.tsx`, `CloseShiftModal.test.tsx`, `ShiftGate.test.tsx`, `useShiftStore.test.ts`.
* Assert ticket shows card/credit; assert blind modal does not show those labels.

## Additional Considerations

* Implement **after** 029 is available (or mock new fields in Vitest).
* Do not show running tender totals during an open shift in this feature.
