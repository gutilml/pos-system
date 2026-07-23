# Specification: Feature 024 - Frontend Shift Discrepancy Ticket

## Objective
After a successful blind-count close, show the cashier a close ticket with expected cash, counted cash, and discrepancy, and allow browser print. Printing (or dismissing) the ticket is the system’s end of responsibility—no manager override or approval flow.

## Scope
* **Strictly Frontend:** Only `frontend/` (and docs) changes.
* **Depends on:** Existing Feature 007 `POST /api/v1/shifts/{id}/close`, which already returns `expectedCash`, `actualCash`, and `discrepancy` on the closed `ShiftDTO`.
* **Out of scope:** Manager auth / variance override, pay-in/pay-out UI, shift history API, receipt printing for sales, Auth/RBAC, fixing backend expected-cash formula (see plan Additional Considerations).

## UX & Business Rules
* Blind count remains blind: `CloseShiftModal` must not show expected cash before submit.
* On successful close, present a **Shift Close Ticket** UI (modal or dedicated panel) with at least:
  * Expected cash
  * Counted (actual) cash
  * Discrepancy (`actual − expected`), clearly labeled as overage or shortage when non-zero (and zero when exact)
  * Useful context: shift id (short), opened/closed timestamps if available
* Provide an explicit **Print** action that uses the browser print dialog (`window.print`) with a print-friendly layout.
* Provide **Done / Dismiss** so the cashier can continue; after dismiss, the register returns to the no-open-shift gate (`OpenShiftModal`) as today.
* Closing with a non-zero discrepancy is allowed without manager approval (product decision 2026-07-17).
* Do not auto-open a new shift.

## Acceptance Criteria
1. [x] Successful close still clears the open shift and resets tickets; expected totals are never shown during the blind-count step.
2. [x] After a successful close, the UI shows expected cash, actual cash, and discrepancy from the close API response (not client-invented math).
3. [x] Print produces a readable close ticket via browser print (dedicated print styles or print-only region).
4. [x] Dismissing the ticket returns the cashier to the Open Shift gate with no lingering closed-shift state blocking the register incorrectly.
5. [x] Vitest covers: close response surfaced on ticket; print/dismiss paths; blind count still hides expected before submit.
6. [x] Pending frontend “Post-close discrepancy ticket” marked done (Feature 024); `docs/README.md` catalog/topic updated.
