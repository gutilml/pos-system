# Feature 063 — Frontend Inventory Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Inventory workspace list + adjust/receive modal; read-only when flag off; register negative-stock warning.

## Summary

Replace Inventory coming-soon with a workspace: searchable product stock list, low-stock filter, modal for adjust/receive against Feature **062**. When `enableInventory` is false, nav stays and workspace is read-only. Register warns when a line would leave stock negative.

## Depends on

* Backend **062**, workspace shell **054**.

## Out of scope

* Admin notify; purge inventory on disable.
