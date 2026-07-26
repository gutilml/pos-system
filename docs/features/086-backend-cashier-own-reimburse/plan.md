# Plan — 086 Backend cashier-own reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Require **079** ownership column populated on new sales.
2. Apply role-aware filters in transaction list/get/reimburse.
3. Tests: cashier own/other, admin override, unauthenticated.
4. Unlock FE **087**.
