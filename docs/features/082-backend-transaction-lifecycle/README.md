# Feature 082 — Backend transaction lifecycle

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Planned — Deferred (product design)**

## Summary

Hold / void / resume APIs aligning schema statuses `IN_PROGRESS` / `HELD` / `VOIDED`. Not reimburse (**072**). Stripe IN_PROGRESS path remains separate / on hold.

## Unlocks

FE **083**.

## Out of scope

* Reimburse of COMPLETED (**072**); CARD refunds (**084**); Stripe session revive.
