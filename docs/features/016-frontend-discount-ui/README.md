# Feature 016 — Frontend Discount UI & Visual Math

## What it does

Cashiers can apply **item-level** and **global** percentage discounts on the register. Totals update in real time using the same cascade rules as Feature 015’s backend engine: item discount first, then global only on lines that are not excluded and have no item discount. Discounted lines show strikethrough original totals; excluded products show a **No Global %** badge.

## Architecture

### Pricing (`src/lib/discountPricing.ts`)

Pure functions mirror `DiscountPricing.priceLine` on the backend:

1. Apply item discount to catalog unit price
2. Skip global when `excludeFromGlobalDiscounts` **or** `itemDiscountPercentage > 0`
3. Subtotal / savings derived from per-line totals

UI inputs show whole percents (`10`); store and API use decimal fractions (`0.10`).

### State (`useCartStore`)

Per ticket:

- `globalDiscountPercentage: number`
- Each `CartItem` may carry `itemDiscountPercentage` and `excludeFromGlobalDiscounts` (copied from product on add)

Selectors: `selectSubtotal`, `selectTaxTotal`, `selectGrandTotal`, `selectTotalDiscountAmount`, `selectItemPricedLine`, plus updated tender selectors that accept global discount. Persist version **4** migrates missing discount fields.

### UI

- `CartItemRow` — item `%` input, strikethrough original line total, exclusion badge
- `CheckoutFooter` — global `%` input, “Discount saved” row, discounted subtotal/tax/total
- `CheckoutModal` / `RegisterScreen` card path — POST discount fields when &gt; 0

### API

`createTransaction` sends optional `globalDiscountPercentage` and per-item `itemDiscountPercentage` (Feature 015 DTO shape).

## Tests

- `discountPricing.test.ts` — cascade math (mixed cart subtotal `6.5410`, savings `0.4490`)
- `useCartStore.test.ts` — store integration for item/global/excluded combinations
- `CartItemRow.test.tsx` — strikethrough, badge, item % blur commit
- `CheckoutFooter.test.tsx` — discount saved + reduced total
- `CheckoutModal.test.tsx` — discount fields in checkout payload
