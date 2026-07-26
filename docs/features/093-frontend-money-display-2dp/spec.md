# Feature: Frontend money display 2 decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers cannot finish Pay when the cart grand total has a third decimal (e.g. **58.428**): entering **58.42** leaves Remaining **0.008**, and entering more than the total is rejected as overpay. Restore **2** decimal money UI and align payable totals/tenders to 2 dp so Remaining can hit **0.00**.

## User Stories

* As a cashier, I want money amounts shown with two decimals so they match how I enter cash/card/credit.
* As a cashier, I want split pay to complete when tenders sum to the payable total with no stranded mills.

## Scope

* **Strictly Frontend:** [`money.ts`](../../../frontend/src/lib/money.ts), cart payable selectors, Pay modal / tender fields, related Vitest, docs.
* **Depends on:** none (supersedes **071** display).
* **Unlocks:** none.

## Locked defaults

* `MONEY_DISPLAY_SCALE = 2` for all `formatMoney` surfaces.
* Payable grand total / Remaining / overpay caps / `canComplete` use **2** dp HALF_UP (e.g. 58.428 → **58.43**).
* Internal line/discount math keeps `MONEY_SCALE = 4` / `roundMoney`.
* On PAY, `paymentsForApi` remaps tender sums to the internal 4 dp grand total for the BE.
* No backend changes; quantities/weight unchanged.

## Acceptance Criteria

1. [x] Money UI shows two decimals (totals, tenders, tickets, credit, shift cash).
2. [x] Pay Remaining can reach 0.00 when tenders equal payable total; no stranded 0.00x.
3. [x] Overpay still blocked above payable total.
4. [x] Vitest updated; pending/catalog Done on ship; **071** README notes superseded.
