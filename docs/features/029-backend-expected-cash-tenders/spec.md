# Feature: Backend Expected Cash = CASH Tenders Only

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Fix shift close reconciliation so `expectedCash` reflects cash drawer movement only: starting float, CASH `transaction_payments` net of `change_given`, and pay-in/pay-out events — not sale `grandTotal`s. CARD and CREDIT (store tab) are excluded from expected cash and discrepancy; they are returned on the closed-shift DTO as sales-summary totals for the post-close ticket (Feature 030). Blind count UX is unchanged (no expected totals before close).

## User Stories

* As a cashier, I want expected drawer cash to ignore card and store-tab tenders so my discrepancy matches what should be in the till.
* As a cashier, I want cash over-tender change to reduce expected drawer cash so counting matches physical cash left in the till.
* As a store owner, I want CARD and CREDIT shift totals on the close response so the printed close ticket can show non-cash sales without mixing them into drawer variance.
* As a developer, I want reconciliation math sourced from `transaction_payments` so split tenders reconcile correctly.

## Scope

* **Strictly Backend:** `backend/`, feature/pending docs, `docs/README.md`. Update Feature 007 cash-math docs to match.
* **Depends on:** Feature 007 (shifts), Feature 013 (`transaction_payments` / `PaymentType`).
* **Out of scope:** Frontend ticket UI (030); pay-in/pay-out UI; shift history API; manager override; schema columns for tender summaries (compute into DTO); Auth/RBAC.

## Business Rules & Technical Constraints

* **`expectedCash`** (scale 4, `HALF_UP`):
  `startingCash + sum(CASH payment amounts for COMPLETED shift transactions) − sum(change_given for those COMPLETED transactions) + payIns − payOuts`
  * Do **not** use `sum(transaction.grandTotal)`.
  * `change_given` netting prevents cash over-tender from inflating expected drawer cash (approved 2026-07-22).
* **`discrepancy`** = `actualCash − expectedCash` (unchanged).
* **CARD / CREDIT:** same treatment — sum payment amounts for COMPLETED shift transactions for sales summary only; **not** in `expectedCash` / discrepancy.
* Prefer summing only **`COMPLETED`** transactions (exclude `VOIDED` / `IN_PROGRESS` / `HELD` if present).
* On **close**, `ShiftDTO` must include tender/sales summary fields (nullable on OPEN responses):
  * `totalCardPayments` — required
  * `totalCreditPayments` — required
  * `totalCashPayments` — CASH tender sum (before change netting display; or net cash retained — document in README as gross CASH payments sum)
  * `totalSalesGrandTotal` — `sum(grandTotal)` for COMPLETED shift sales; context only, not used in discrepancy
* Persist only existing shift money columns (`expected_cash`, `actual_cash`, `discrepancy`). Summary fields are computed into the DTO at close (and when mapping a closed shift if recomputed).
* No change to open/close/events routes or blind-count request body (`actualCash` only).

## Acceptance Criteria

1. [ ] `calculateExpectedCash` / close no longer uses `sumGrandTotalByShiftId` for expected cash.
2. [ ] Expected cash = starting + CASH payments − change_given + pay-ins − pay-outs (BigDecimal scale 4).
3. [ ] A shift with only CARD and/or CREDIT payments (no CASH tenders, no drawer events) has `expectedCash == startingCash` and discrepancy = actual − starting.
4. [ ] Split tender (CASH + CARD/CREDIT): only the CASH payment amount (net of that transaction’s change_given allocation as defined) increases expected cash relative to non-cash tenders.
5. [ ] Cash over-tender: CASH payment $20, sale $14, change_given $6 → expected cash increases by $14 (net), not $20.
6. [ ] Closed `ShiftDTO` includes `totalCardPayments` and `totalCreditPayments` (and `totalCashPayments`, `totalSalesGrandTotal`).
7. [ ] CARD/CREDIT totals do not affect `discrepancy`.
8. [ ] OPEN shift DTOs leave summary fields null; close populates them.
9. [ ] JUnit/Mockito (and controller contract tests) cover CASH-only, CARD-only, CREDIT-only, split, over-tender/change, pay-in/pay-out.
10. [ ] Feature 007 README cash math updated; pending backend item marked done / noted with Feature 030; `docs/README.md` catalog + topic updated.
