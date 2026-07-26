# Feature 079 — Backend shift audit stamps

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Summary

**Option A:** Persist `opened_by` / `closed_by` on shifts from JWT; `created_by` on transactions at sale create. Still **one OPEN shift per store** (not Option B per-user shifts).

## Unlocks

BE **086** (cashier-own reimburse); soft unlock FE **080**.

## Out of scope

* One open shift per user (Option B); FE labels (**080**); reimburse filter logic (**086**).
