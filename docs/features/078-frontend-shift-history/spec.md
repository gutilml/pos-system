# Feature: Frontend shift history / reconciliation

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Staff need a register or workspace UI to browse past shifts and review events/totals without relying only on the close-ticket print flow.

## User Stories

* As a cashier, I want to open a shift history list so I can pick a closed shift.
* As a cashier, I want to see events and totals for a selected shift so I can reconcile.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** BE **077**.
* **Unlocks:** none (polish companion **080** optional).

## UX

* Entry point: shift menu / workspace (reuse existing shift chrome where possible).
* List: date/time, status, starting cash, closed totals summary.
* Detail: events timeline + expected vs counted if available.
* EN/ES strings.

## Acceptance Criteria

1. [x] List loads from `GET /api/v1/shifts?storeId=`.
2. [x] Detail loads from `GET /api/v1/shifts/{id}` with events/totals.
3. [x] Loading/empty/error states; EN/ES.
4. [x] Component tests; pending/catalog when Done.
