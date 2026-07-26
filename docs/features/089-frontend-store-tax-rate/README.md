# Feature 089 — Frontend store tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Cart tax hydrates from `/me.defaultTaxRate`; CashierMenu edits store `preferences.default_tax_rate` (percent UI → fraction PATCH). No per-ticket override.

## Summary

Hydrate `useCartStore` `taxRate` from store settings / `/me` (`default_tax_rate`). Settings edit in CashierMenu. **No** per-ticket tax override UI in v1. Checkout POST sends cart `taxRate`.

## Depends on

BE **088**.
