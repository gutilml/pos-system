# Feature 029 — Backend Expected Cash = CASH Tenders Only

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done**

## Behavior

* `expectedCash` = starting cash + CASH `transaction_payments` − `change_given` (COMPLETED sales) + pay-ins − pay-outs.
* Do **not** use sale `grandTotal`s for drawer expected.
* CARD and CREDIT (store tab): sales-summary totals only — not in `expectedCash` / discrepancy.
* `discrepancy` = counted cash − `expectedCash`.
* Closed `ShiftDTO` includes `totalCashPayments`, `totalCardPayments`, `totalCreditPayments`, `totalSalesGrandTotal` (OPEN → null).
* Blind count unchanged (request body still `actualCash` only).

## Depends on

Features 007 (shifts), 013 (`transaction_payments`).

## Follow-up

Feature 030 — post-close ticket shows CARD/CREDIT (+ cash/sales summary).

## Out of scope

Frontend ticket UI; pay-in/pay-out UI; shift history; new `shifts` columns for tender audits.
