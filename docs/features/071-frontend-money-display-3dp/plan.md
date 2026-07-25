# Plan — 071 Frontend money display 3 decimals

## Approach

1. Set `MONEY_DISPLAY_SCALE = 3` in [`frontend/src/lib/money.ts`](../../../frontend/src/lib/money.ts); update comment.
2. Fix [`money.test.ts`](../../../frontend/src/lib/money.test.ts) expectations.
3. Replace `balance.toFixed(2)` in [`CustomerPaymentModal.tsx`](../../../frontend/src/features/admin/CustomerPaymentModal.tsx) with `formatMoney(balance)`.
4. Grep for other money `toFixed(2)` / hardcoded 2 dp display; route through `formatMoney`.
5. Mark triad/pending/catalog Done; commit `fix(071): display money amounts with three decimal places`.

Most screens already call `formatMoney` and will pick up 3 dp automatically.
