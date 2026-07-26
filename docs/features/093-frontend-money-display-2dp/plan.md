# Implementation Plan - Frontend money display 2 decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. [`frontend/src/lib/money.ts`](../../../frontend/src/lib/money.ts): set `MONEY_DISPLAY_SCALE = 2`; add `roundMoneyDisplay` at 2 dp HALF_UP.
2. [`useCartStore.ts`](../../../frontend/src/store/useCartStore.ts): `selectPayableGrandTotal`, balance due / tender caps / `canComplete`; `paymentsForApi` remaps to internal 4 dp for create-transaction.
3. [`TenderAmountFields.tsx`](../../../frontend/src/components/checkout/TenderAmountFields.tsx) + [`CheckoutModal.tsx`](../../../frontend/src/components/checkout/CheckoutModal.tsx): format and commit tenders at 2 dp vs payable total.
4. Tests: `money.test.ts`, cart mill case, CheckoutModal API remap.
5. Docs: triad Done; catalog **093**; **071** superseded.

## Backend

None (FE remaps payment amounts on submit so non-cash stays within BE 4 dp grand total).

