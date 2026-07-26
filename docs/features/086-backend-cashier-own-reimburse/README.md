# Feature 086 — Backend cashier-own reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Summary

Filter list/get/reimburse so cashiers only see and reimburse tickets they own (`created_by` from **079**). Legacy null ownership is **ADMIN-only**. **ADMIN** may list/reimburse all store tickets.

## Depends on

BE **079** (ownership stamps).

## Unlocks

FE **087**.
