# Feature: Frontend money display 3 decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

All money amounts shown in the POS UI display with exactly three digits after the decimal point. Cart math and API money remain four-decimal internal scale.

## Acceptance Criteria

1. [x] `formatMoney(150)` → `150.000`; scale constant is 3.
2. [x] Screens using `formatMoney` show 3 dp.
3. [x] Customer payment modal balance uses `formatMoney`.
4. [x] Vitest for `money.ts` updated; no money `toFixed(2)`.
5. [x] Catalog Done + pending struck.
