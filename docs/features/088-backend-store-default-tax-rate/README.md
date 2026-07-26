# Feature 088 — Backend store default tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Summary

Allowlist `default_tax_rate` in store `preferences` (**045**); expose via settings GET/PATCH and `defaultTaxRate` on login `/auth/me`. Decimal fraction in `[0, 1]` (scale 4). Source of truth for register tax — no per-ticket override API in this feature.

## Unlocks

FE **089**.
