# Feature 059 — Backend Product Target Margin Backfill

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — persist derived `target_margin` on product write when missing; SQL + seed backfill for existing rows.

## Summary

When a product has positive `cost_price` and `selling_price` but `target_margin` is null, derive margin with `1 - (cost / selling)` and persist it on create/update. One-time migration and seed updates cover legacy/demo rows so the Products editor shows margin without frontend changes.

## Depends on / unlocks

* Builds on: Feature **050** pricing helpers (`ProductPricing.marginFromCostAndPrice`).
* Unlocks: Products workspace margin field populated for seed/legacy catalog (FE already binds `targetMargin`).

## Out of scope

* Frontend display fallback via `effectiveMargin`.
* DB triggers / generated columns.
* Recalculating margin when an explicit `targetMargin` is already stored.
