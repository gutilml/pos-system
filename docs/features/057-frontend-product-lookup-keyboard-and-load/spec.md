# Feature: Frontend Product Lookup Keyboard + Editor Load Fix

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Fix Product tab UX gaps: keyboard navigation in the lookup suggestion list, and empty editor + abort error when selecting a product.

## Acceptance Criteria

1. [x] ArrowDown/Up moves highlight through product lookup suggestions.
2. [x] Enter with highlighted row opens that product for edit.
3. [x] Selecting a product loads fields without “signal is aborted” error.
4. [x] Vitest covers keyboard select and abort-safe editor load.
