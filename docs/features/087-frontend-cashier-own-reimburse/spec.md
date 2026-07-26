# Feature: Frontend cashier-own reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Align closed-tickets UI with cashier-own filtering: empty states and messages when the list is “my tickets only”; admins keep full store list.

## User Stories

* As a cashier, I want Previous tickets to show only my sales with a clear label.
* As an admin, I want to browse all store tickets unchanged.

## Scope

* **Strictly Frontend:** closed-tickets UI (**073**).
* **Depends on:** BE **086**.
* **Unlocks:** none.

## UX

* Banner or subtitle: “Your tickets” for CASHIER; “All store tickets” for ADMIN.
* Handle empty own-list; surface 403 from reimburse gracefully.
* EN/ES.

## Acceptance Criteria

1. [x] Cashier UI reflects filtered list from API.
2. [x] Admin UI shows all store tickets.
3. [x] Friendly empty/error copy; EN/ES.
4. [x] Component tests; pending/catalog when Done.
