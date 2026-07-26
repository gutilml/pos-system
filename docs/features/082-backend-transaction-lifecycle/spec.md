# Feature: Backend transaction lifecycle

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Today sales are typically persisted as `COMPLETED` immediately. Product may later need hold/void/resume aligning `IN_PROGRESS`, `HELD`, and `VOIDED`. Design deferred; not the same as reimburse.

## User Stories

* As a cashier, I want to hold a ticket on the server so another register can resume it (if product requires).
* As a cashier, I want to void a not-completed ticket so it cannot be paid.

## Scope

* **Strictly Backend:** transaction status transitions.
* **Depends on:** core transactions (**003**); product design for hold semantics.
* **Unlocks:** FE **083**.

## APIs (sketch — finalize at design time)

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/api/v1/transactions` (or update) | Create/update `IN_PROGRESS` / `HELD` |
| `POST` | `/api/v1/transactions/{id}/hold` | Mark `HELD` |
| `POST` | `/api/v1/transactions/{id}/resume` | Return to `IN_PROGRESS` |
| `POST` | `/api/v1/transactions/{id}/void` | Mark `VOIDED` (not COMPLETED) |

## Acceptance Criteria

1. [ ] Product design locked (who can void, inventory timing, multi-register).
2. [ ] Status transitions enforced; illegal transitions rejected.
3. [ ] COMPLETED + reimburse path (**072**) unchanged.
4. [ ] JUnit; pending/catalog when Done.
