# Feature: Frontend Cash Drawer Pay-In / Pay-Out

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Give cashiers a register UI to record cash drawer pay-ins and pay-outs against the open shift, using the existing Feature 007 events API so expected cash on close stays accurate.

## User Stories

* As a cashier, I want to add cash to the drawer (pay-in) with a reason so float top-ups are reflected in expected cash.
* As a cashier, I want to remove cash from the drawer (pay-out) with a reason so safe drops / petty cash are reflected in expected cash.
* As a cashier, I want clear success/error feedback so I know the event was saved before continuing to sell.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 007 `POST /api/v1/shifts/{id}/events` (already shipped).
* **Out of scope:** Backend validation policy changes; manager override; listing past drawer events; shift history API; role-gated pay-in/out; sales receipt / event print; changing close-ticket or blind-count UX.

## UX & Business Rules

* **Entry point:** Cashier menu items (or one item opening a modal with type selector) — available only when `currentShift` is open.
* **Fields:** type (`PAY_IN` | `PAY_OUT`), amount (> 0), reason (required free text; trim before submit).
* **API:** `POST /api/v1/shifts/{shiftId}/events` with `{ type, amount, reason }` via existing `apiFetch` (credentials + CSRF).
* **No expected-cash display** in this modal (do not show running expected till or invent client-side drawer math).
* On success: close modal, clear form, optional brief success message; shift remains open.
* On failure: keep modal open, show API/error message; do not clear amount/reason.
* ADMIN and CASHIER both allowed (v1 equal permissions).

## Acceptance Criteria

1. [ ] Client helper posts drawer events to `/api/v1/shifts/{id}/events`.
2. [ ] Cashier can open a pay-in / pay-out flow from the cashier menu when a shift is open.
3. [ ] Modal/form requires type, positive amount, and non-blank reason before submit.
4. [ ] Successful submit calls the API with the open shift id and closes the form.
5. [ ] Failed submit shows an error and leaves the form editable.
6. [ ] Menu entry is disabled or hidden when there is no open shift.
7. [ ] Vitest covers happy path + validation + error path (mock API).
8. [ ] Pending frontend pay-in/pay-out item marked done; `docs/README.md` catalog updated.
