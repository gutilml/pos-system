# Feature 076 — Frontend product editor category, parent & weight UOM UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — searchable category + inline add, searchable parent with derived cost / inventory lock, weight UOM chips. **Partial supersede:** Feature [098](../098-frontend-parent-package-editor-guards/README.md) / [097](../097-backend-parent-pc-no-weight-child/README.md) disallow sell-by-weight when parent package unit is `pc`.

## Summary

Searchable category picker with inline create, searchable parent with derived child cost/margin retail and inventory locked off, and sell-by-weight unit chips so `unitOfMeasure` is sent (fixes Feature 074 regression).

## Out of scope

* BE validation changes; Category tab redesign; parent-package completeness modal (**053**).
