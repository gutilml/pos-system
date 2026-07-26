# Feature: Backend drawer event policy

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Drawer PAY_IN / PAY_OUT events exist without product-defined caps or role gates. Defer until product sets max amounts and/or ADMIN vs CASHIER rules; then enforce on the BE event API.

## User Stories

* As an admin, I want pay-in/out amounts capped so cashiers cannot move arbitrary cash.
* As an admin, I want only authorized roles to post certain drawer events (once RBAC diverges).

## Scope

* **Strictly Backend:** validate `POST` shift drawer events.
* **Depends on:** Feature **007**; Auth **025** roles; product decisions on caps/RBAC.
* **Unlocks:** none (FE **031** already shipped).

## APIs

* Existing `POST` drawer event endpoint(s) under shifts — add validation only:
  * Reject amounts above configured max (source TBD: prefs vs constants).
  * Optionally require ADMIN for amounts above a soft threshold or for PAY_OUT.
  * Reason required / length rules if product requires.

## Acceptance Criteria

1. [ ] Product caps and/or RBAC rules documented and implemented.
2. [ ] Over-cap and unauthorized calls return clear 4xx.
3. [ ] Under-cap authorized events unchanged for cashiers.
4. [ ] JUnit coverage; pending/catalog when Done.
