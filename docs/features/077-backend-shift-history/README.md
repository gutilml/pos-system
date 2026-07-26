# Feature 077 — Backend shift history / lookup

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Summary

Store-scoped APIs to list shifts (open and closed) and fetch a shift by id with events and totals for reconciliation. Extends Feature **007** / **017**.

* `GET /api/v1/shifts?storeId=&status=` — newest `openedAt` first; optional status filter; 404 if store missing.
* `GET /api/v1/shifts/{id}` — `ShiftDetailDTO` with events + expected/tender totals (live expected for OPEN).

## Unlocks

FE **078**.

## Out of scope

* FE UI; audit user stamps (**079**); drawer policy caps (**081**).
