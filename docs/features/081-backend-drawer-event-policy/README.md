# Feature 081 — Backend drawer event policy

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done**

## Summary

Server-side policy now enforces:

- **PAY_IN:** no max cap.
- **PAY_OUT:** allowed when amount is within current drawer cash.
- **Over-cash PAY_OUT:** requires same-user password approval.
- **Reason:** required, trimmed, minimum 10 chars, and must include at least one letter/number.
- **Reimbursements (072):** cash portions follow the same over-cash approval rule.

## Unlocks

- Hardens existing **007** events / **031** UI.
- Enables FE follow-up: approval-password UX for over-cash drawer events and reimbursements.

## Out of scope

* Redesigning FE **031** and closed-ticket reimbursement UI (frontend follow-up required).
* Role split between ADMIN/CASHIER (still parity).
