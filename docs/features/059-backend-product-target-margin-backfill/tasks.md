# Task Checklist — Feature 059

## Backend Tasks

- [x] 1. `ProductPricing.backfillTargetMargin` + unit tests.
- [x] 2. `ensureStoredTargetMargin` at end of `resolveAndApplyPricing` (keep existing selling when no request price/margin).
- [x] 3. Migration `059-product-target-margin-backfill.sql` + seed `target_margin` values.
- [x] 4. Docs triad + pending + catalog.

## Test Tasks

- [x] 5. Service tests: create cost+selling, update backfill, hierarchy stores margin.
