# Feature: Frontend Money Display 2 Decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers expect money amounts as two-decimal currency (e.g. `12.50`), while the system continues to compute and send values at four-decimal scale for precision. Today `formatMoney` uses `toFixed(4)` everywhere, which is noisy on the register.

## User Stories

* As a cashier, I want prices, totals, tenders, and shift cash figures shown with 2 decimals so the register matches how money is spoken and counted.
* As a developer, I want math helpers to keep 4-scale rounding so checkout payloads stay aligned with the backend.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Out of scope:** Backend `MONEY_SCALE`; changing `createTransaction` amounts’ wire scale; forcing quantity/weight UI to 2 dp; locale-specific currency symbols (keep plain numeric tabular display unless already present).

## UX & Business Rules

* Introduce a display scale constant (e.g. `MONEY_DISPLAY_SCALE = 2`) used only by `formatMoney`.
* Keep `MONEY_SCALE = 4` and `roundMoney` / `lineTotal` behavior unchanged.
* Every money label that goes through `formatMoney` automatically becomes 2 dp (cart rows, footer, checkout, customer credit available, shift close ticket, drawer amounts if they use `formatMoney`).
* Quantity / weight fields must **not** be routed through `formatMoney` solely to “fix” decimals — add `formatQuantity` only if a call site today misuses `formatMoney` for qty (prefer leaving qty as-is / 4 dp).
* Tender draft defaults should show 2 dp for usability but still parse and `roundMoney` at 4 before store/API.

## Acceptance Criteria

1. [ ] `formatMoney` renders exactly 2 decimal places for money UI.
2. [ ] `roundMoney` / `lineTotal` remain 4-scale.
3. [ ] Cart, checkout, footer, and shift money labels show 2 dp via shared helper.
4. [ ] Quantity / weight entry displays are not forced to 2 dp by this change.
5. [ ] Existing Vitest assertions on money strings updated to 2 dp where they snapshot `formatMoney`.
6. [ ] Pending “Money display 2 decimals” notes Feature 033; `docs/README.md` updated.
