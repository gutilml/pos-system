# Task Checklist — Feature 033 Frontend Money Display 2 Decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add `MONEY_DISPLAY_SCALE = 2`; change `formatMoney` in `money.ts`; keep `roundMoney` at 4.
- [x] 2. Audit call sites; ensure qty/weight are not forced through money display.
- [x] 3. Document README; promote pending item with Feature 033; update `docs/README.md`.

## Test Tasks

- [x] 4. Unit + update snapshot/string assertions for 2 dp money display.
