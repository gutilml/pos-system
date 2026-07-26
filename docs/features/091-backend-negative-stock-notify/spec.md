# Feature: Backend negative-stock notify

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

When inventory-enabled sales drive stock below zero, notify an admin or restock owner. Delivery channel is undecided; triad deferred until channel + recipients are chosen.

## User Stories

* As an admin, I want to be notified when a sale leaves stock negative so I can restock.

## Scope

* **Strictly Backend:** detect negative crossing + dispatch notification.
* **Depends on:** inventory (**005** / **052**); channel decision.
* **Unlocks:** FE **092**.

## APIs / behavior

* Hook after stock deduction on sale (and possibly reimburse restore — product TBD).
* Emit notification via chosen channel; idempotency / throttle TBD.
* Config: who receives (store prefs vs role).

## Acceptance Criteria

1. [ ] Channel and recipients decided and documented.
2. [ ] Negative stock after sale triggers notify once per policy.
3. [ ] No notify when inventory disabled.
4. [ ] Tests; pending/catalog when Done.
