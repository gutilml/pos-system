# Feature: Frontend transaction lifecycle

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Once the backend supports hold/void/resume, the register needs UI to void or hold tickets and optionally sync with or replace local TicketTabs.

## User Stories

* As a cashier, I want to void an unpaid ticket from the UI.
* As a cashier, I want to hold/resume a ticket when the server owns ticket state.

## Scope

* **Strictly Frontend:** `frontend/`.
* **Depends on:** BE **082**.
* **Unlocks:** none.

## UX

* Actions on active ticket: Hold, Void (confirm), Resume from held list.
* Clarify relationship to **009** client tabs (replace vs dual until cutover).
* EN/ES; error toasts on illegal transitions.

## Acceptance Criteria

1. [ ] Hold/void/resume wired to **082** APIs.
2. [ ] Confirm dialog for void; clear error states.
3. [ ] TicketTabs strategy documented and implemented.
4. [ ] Component tests; pending/catalog when Done.
