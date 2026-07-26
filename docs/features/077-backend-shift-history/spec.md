# Feature: Backend shift history / lookup

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers and admins need to look up past (and current) shifts for a store, including drawer events and close totals, so reconciliation is not limited to the live open shift.

## User Stories

* As a cashier/admin, I want to list shifts for my store so I can find a closed shift to reconcile.
* As a cashier/admin, I want to load a shift by id with events and totals so I can review drawer activity.

## Scope

* **Strictly Backend:** `backend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature **007** (shifts), **017** (current).
* **Unlocks:** FE **078**.

## APIs

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/shifts?storeId=` | List shifts for store (open + closed); newest first; optional `status` filter |
| `GET` | `/api/v1/shifts/{id}` | Shift detail: events, expected/close totals, starting cash |

## Acceptance Criteria

1. [x] List returns store-scoped shifts ordered by time desc.
2. [x] Get by id returns events + totals; 404 if missing; reject cross-store access.
3. [x] Existing open/current/close/events endpoints unchanged.
4. [x] JUnit/WebMvc tests + pending/catalog updates when Done.
