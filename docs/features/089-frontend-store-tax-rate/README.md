# Feature 089 — Frontend store tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Cart tax hydrates from `/me.defaultTaxRate`. **Tax edit UI moved to Feature [095](../095-frontend-tax-rate-store-config/README.md)** (Settings workspace); CashierMenu no longer edits tax.

## Summary

Hydrate `useCartStore` `taxRate` from store settings / `/me` (`default_tax_rate`). Settings edit in **Settings** workspace (**095**). **No** per-ticket tax override UI in v1. Checkout POST sends cart `taxRate`.

## Depends on

BE **088**.
