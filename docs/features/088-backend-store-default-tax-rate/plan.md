# Plan — 088 Backend store default tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Extend **045** preferences allowlist with `default_tax_rate` + validation.
2. Settings DTO mapping; optional `/me` field.
3. Seed/demo default; tests for PATCH validation.
4. Unlock FE **089**.
