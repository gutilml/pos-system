# Feature 081 — Backend drawer event policy

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Planned — Deferred (needs product caps/RBAC)**

## Summary

Server-side validation for PAY_IN / PAY_OUT: max amounts and/or who may authorize. FE **031** already ships against the open API; this feature hardens the backend once product sets caps/RBAC.

## Unlocks

None (hardens existing **007** events / **031** UI).

## Out of scope

* Redesigning FE **031**; full role matrix beyond agreed caps.
