# Plan — 103 Inventory modal focus + receive price UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. `qtyInputRef` + rAF focus on modal open.
2. `lotUnitCost` state for API; Cost field shows blend via `previewReceiveBlend` after qty/blur; focus restores lot cost for editing.
3. `reverseIncomingUnit` for submit selling/wholesale.
4. Remove preview panel; rename i18n keys.
