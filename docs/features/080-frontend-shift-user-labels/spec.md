# Feature: Frontend shift user labels

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Optional polish: surface who opened and closed a shift on the close discrepancy ticket and in shift history detail.

## User Stories

* As a cashier, I want the close ticket to show who opened/closed the shift for the paper trail.
* As a reviewer, I want history detail to show opener/closer names.

## Scope

* **Strictly Frontend:** `frontend/`.
* **Depends on:** BE **079**; ideally FE **078** for history.
* **Unlocks:** none.

## UX

* Close ticket (**024** / **030** print): opener + closer labels when present.
* Shift history detail (**078**): same labels.
* Fallback: hide or show “—” when null (legacy shifts).
* EN/ES.

## Acceptance Criteria

1. [ ] Close ticket shows opener/closer when API provides them.
2. [ ] History detail shows opener/closer when available.
3. [ ] Null-safe for legacy shifts; EN/ES.
4. [ ] Component tests; pending/catalog when Done.
