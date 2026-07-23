# Feature 033 — Frontend Money Display 2 Decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* `formatMoney` displays **2** decimal places (`MONEY_DISPLAY_SCALE`).
* `roundMoney` / cart math stay at **4**-scale (`MONEY_SCALE`).
* Quantity/weight fields are not forced through money display formatting.

## Key files

* `frontend/src/lib/money.ts`
* `frontend/src/lib/money.test.ts`
