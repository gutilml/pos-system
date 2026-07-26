# Feature: Backend cashier-own reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

After sale ownership exists, restrict closed-ticket list and reimburse to tickets owned by the current user. ADMIN overrides and can act on any store ticket.

## User Stories

* As a cashier, I want to only see my own closed tickets so I do not reimburse someone else’s sale by mistake.
* As an admin, I want to reimburse any store ticket.

## Scope

* **Strictly Backend:** filter/authorize on **072** list/get/reimburse.
* **Depends on:** **079** (`created_by` or equivalent ownership).
* **Unlocks:** FE **087**.

## APIs

* `GET /api/v1/transactions?storeId=` — CASHIER: only `created_by = currentUser`; ADMIN: all store COMPLETED.
* `GET` / `POST …/reimburse` — reject CASHIER if ticket not owned; ADMIN allowed.
* Legacy `created_by` null → ADMIN only (cashiers cannot see/reimburse).
* Ownership denial → **403** `AccessDeniedException` with a clear message (list silently filters).

## Acceptance Criteria

1. [x] Cashier list filtered to own tickets.
2. [x] Cashier reimburse of others’ tickets → 403/404 per API style.
3. [x] ADMIN sees and reimburses all store tickets.
4. [x] JUnit role matrix; pending/catalog when Done.
