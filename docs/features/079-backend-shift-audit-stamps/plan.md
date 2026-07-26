# Plan — 079 Backend shift audit stamps

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Schema migration for `opened_by` / `closed_by` (+ optional `transactions.created_by`).
2. Wire open/close (and sale create) to SecurityContext user id.
3. Extend ShiftDTO / TransactionDTO; backfill nulls for historical rows.
4. Tests: stamps set, one-OPEN invariant, null-safe reads.
5. Mark Done; note unlocks **080** / **086**.
