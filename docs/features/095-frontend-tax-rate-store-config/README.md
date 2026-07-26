# Feature 095 — Frontend tax rate store config

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Tax editor lives in Settings workspace; Cashier menu no longer edits tax. Cart still hydrates from `/me.defaultTaxRate` (Feature **089** hydrate path).

## Summary

Move store tax rate editing from Cashier menu into admin **Settings** workspace (`StoreSettingsWorkspace`). Uses existing `setTaxRateAndPersist` / `preferences.default_tax_rate`. Supersedes Cashier-menu edit from **089**.

## Depends on

BE **088**; hydrate from **089**.
