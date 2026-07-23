# Feature: Frontend Shift Close Ticket Tender Totals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

After Feature 029, extend the post-close Shift Close Ticket to show API CARD and CREDIT totals alongside expected / counted / discrepancy, while keeping Close Shift as a blind count (no expected or tender breakdown before the cashier submits actual cash).

## User Stories

* As a cashier, I want the close ticket to show card and store-tab totals so I can reconcile the shift without those amounts affecting my cash variance.
* As a cashier, I want the blind-count modal to stay blind so I am not influenced by expected or tender totals before counting.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 029 (close `ShiftDTO` fields).
* **Out of scope:** Backend math; pay-in/pay-out UI; manager override; changing print to ESC-POS; showing expected/tenders in `CloseShiftModal`.

## UX & Business Rules

* **Blind count unchanged:** `CloseShiftModal` must not show expected cash, discrepancy, CARD, CREDIT, or sales breakdown before submit.
* **`ShiftCloseTicket`** (after successful close) shows at least:
  * Expected cash, counted cash, discrepancy (overage/shortage/balanced) — existing
  * **CARD total**, **CREDIT (store tab) total** — from API
  * **CASH payments** and **sales grand total** when present — sales summary, clearly not part of discrepancy
* Source of truth = close API fields; do not recompute expected or tender sums on the client.
* Print / Done behavior unchanged (browser print; Done → clear `lastClosedShift` → Open Shift gate).

## Acceptance Criteria

1. [ ] `Shift` type in `frontend/src/api/shifts.ts` includes new nullable summary fields from 029.
2. [ ] `ShiftCloseTicket` renders CARD and CREDIT totals from the closed shift payload.
3. [ ] Ticket also shows CASH payments and/or sales grand total when present.
4. [ ] `CloseShiftModal` still hides expected and all tender/sales totals before submit.
5. [ ] Discrepancy display remains API `discrepancy` (actual − expected); no client inventing drawer math.
6. [ ] Vitest: ticket shows new fields; blind modal still clean; store/fixtures updated.
7. [ ] Pending frontend note for ticket tender totals marked done; `docs/README.md` updated.
