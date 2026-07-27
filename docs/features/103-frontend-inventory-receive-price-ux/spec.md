# Feature: Inventory modal focus + receive price UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Acceptance Criteria

1. [x] Opening Adjust or Receive focuses the quantity field.
2. [x] Receive labels: Cost, Price, Wholesale price (EN/ES).
3. [x] No After-this-receive panel; Cost shows WAC blend after qty + lot cost; Price/Wholesale editable.
4. [x] Save sends lot `unitCost` (not blended) and lot selling/wholesale reverse-mapped from displayed prices.
5. [x] Vitest + catalog Done.
