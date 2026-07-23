# Feature 030 — Frontend Shift Close Ticket Tender Totals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* **Blind count** unchanged in `CloseShiftModal` (no expected cash or tender totals before submit).
* After close, `ShiftCloseTicket` shows cash expected / counted / discrepancy **plus** a **Sales summary** from Feature 029 fields:
  * Cash payments (`totalCashPayments`)
  * Card (`totalCardPayments`)
  * Credit (store tab) (`totalCreditPayments`)
  * Sales grand total (`totalSalesGrandTotal`)
* Missing/null summary fields render as `—`.
* Print / Done unchanged.

## Key files

* `frontend/src/api/shifts.ts` — optional CLOSED summary fields on `Shift`
* `frontend/src/components/shift/ShiftCloseTicket.tsx`
* Tests: `ShiftCloseTicket.test.tsx`, `CloseShiftModal.test.tsx`

## Depends on

Feature 029.

## Out of scope

Backend math; pay-in/pay-out UI; showing expected/tenders in the close modal before count.
