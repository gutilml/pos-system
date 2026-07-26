# Feature: Frontend tax rate store config

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Tax rate is store configuration, not a floor control in the Cashier menu. Cashiers still get cart tax from store defaults; admins/operators edit it under Settings.

## Acceptance Criteria

1. [x] Settings workspace with tax % editor (PATCH `default_tax_rate`).
2. [x] Cashier menu has no tax editor.
3. [x] Cart tax updates after save via existing auth hydrate path.
4. [x] Vitest + triad/catalog Done; **089** notes superseded edit UI.
