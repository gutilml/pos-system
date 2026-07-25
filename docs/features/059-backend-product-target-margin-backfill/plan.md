# Implementation Plan - Backend Target Margin Backfill

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

* Add `ProductPricing.backfillTargetMargin(cost, selling, current)` — return derived margin or keep `current`.
* `ProductServiceImpl.resolveAndApplyPricing` ends with `ensureStoredTargetMargin` so all pricing branches persist margin when derivable.
* When neither request margin nor selling is provided but the product already has `sellingPrice`, keep that price and backfill margin (avoids throwing on name-only updates of legacy rows).
* One-time `docs/migrations/059-product-target-margin-backfill.sql`; seed INSERTs include `target_margin`.

## Tests

* `ProductPricingTest` — derive, keep existing, skip invalid prices.
* `ProductServiceImplTest` — create from cost/selling; update name-only backfill; hierarchy create asserts stored margin.
