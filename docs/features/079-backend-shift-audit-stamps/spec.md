# Feature: Backend shift audit stamps

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Shifts today are store-scoped with no user columns. Product chose **Option A**: stamp who opened and closed a shift (and optionally who created a sale) from the authenticated JWT, without changing the one-OPEN-shift-per-store rule.

## User Stories

* As an admin, I want shifts to record who opened and closed them so reconciliation has an audit trail.
* As a future cashier-own filter, I want sales optionally stamped with creator so ownership can be enforced.

## Scope

* **Strictly Backend:** `backend/` (+ schema/migration, docs).
* **Depends on:** Feature **007**, **025** (JWT user id).
* **Unlocks:** BE **086**; soft FE **080**.

## APIs / schema

* Migration: `shifts.opened_by`, `shifts.closed_by` (UUID FK → users, nullable for legacy rows).
* Optional: `transactions.created_by` from JWT on create COMPLETED sale.
* Open/close responses and shift DTOs expose user ids (and display names if join is cheap).
* Open/current/close rules unchanged: still one `OPEN` shift per store.

## Acceptance Criteria

1. [x] Open shift sets `opened_by` from JWT; close sets `closed_by`.
2. [x] DTOs include opener/closer ids (names optional).
3. [x] Still reject second OPEN shift for same store.
4. [x] Optional `created_by` on new transactions if included in this slice.
5. [x] Migration + JUnit; pending/catalog when Done.
