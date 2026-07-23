# Implementation Plan - Frontend Money Display 2 Decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. API and DB remain `DECIMAL(12,4)`.

## Frontend Architecture

### `frontend/src/lib/money.ts`

* Keep `MONEY_SCALE = 4` for `roundMoney` / `lineTotal`.
* Add `MONEY_DISPLAY_SCALE = 2`.
* Change `formatMoney` to `value.toFixed(MONEY_DISPLAY_SCALE)` (optionally still accept numbers already rounded at 4).
* Export both constants so tests can assert intent.

### Call-site audit

* Grep for `toFixed(` and raw money string formatting outside `formatMoney`; route money through `formatMoney`.
* Confirm weight/qty inputs do not call `formatMoney` for the quantity itself (line **totals** and unit **prices** should).

### Tests

* Unit test `formatMoney(1.2)` → `"1.20"`; `roundMoney` still 4 places.
* Update component tests that assert `"12.5000"`-style strings.

## Additional Considerations

* Half-up display of a 4-scale value via `toFixed(2)` is acceptable for UI; do not double-round API payloads.
* Feature 036 pay redesign will consume the same helper — implement 033 first to avoid churn.
* FE/BE separation: no Java changes.
