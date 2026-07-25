# Feature 062 — Backend Inventory Movements

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — stock movements API, wholesale_margin, receive weighted pricing, sale allows negative stock with SALE history.

## Summary

Add inventory admin APIs: list tracked products (incl. child→parent stock), movement history, POST receive/adjust. Persist `stock_movements` for every qty change including sales. Add `products.wholesale_margin`. Receiving with a new cost blends cost/selling/wholesale via weighted average; adjustments are qty-only (no negative resulting stock). Sales may drive stock negative.

## Depends on / unlocks

* Builds on: 005, 042, 050, 052.
* Unlocks: Frontend **063** Inventory workspace.

## Out of scope

* FE (**063**); admin notify on negative sale; purge inventory when flag off.
