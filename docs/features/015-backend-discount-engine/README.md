# Feature 015 — Backend Discount Engine

## What it does

Checkout pricing now supports **item-level** and **cart-level (global)** discounts in a single cascade. Products can opt out of global discounts via `excludeFromGlobalDiscounts` (special-price items). Every line item stores an audit trail of original price, applied item discount, and final charged unit price.

## Cascade rule (`DiscountPricing`)

All math uses `BigDecimal`, scale 4, `HALF_UP`:

1. `afterItem = originalUnitPrice × (1 − itemDiscountPercentage)`
2. Global discount applies **only** when the line has **no** item discount **and** the product is **not** flagged `excludeFromGlobalDiscounts`:  
   `finalUnitPrice = afterItem × (1 − globalDiscountPercentage)`
3. Otherwise `finalUnitPrice = afterItem` (item-discounted lines and excluded products never receive global)
4. `lineTotal = finalUnitPrice × quantity`
5. `totalDiscountAmount` on the transaction = sum of `(originalUnitPrice × qty − lineTotal)` across lines

Percentages are decimal fractions (e.g. `0.10` = 10%), validated in `[0, 1]`.

## Data model

| Entity | New fields |
|--------|------------|
| `Product` | `excludeFromGlobalDiscounts` (default `false`) |
| `TransactionItem` | `originalUnitPrice`, `itemDiscountPercentage`, `finalUnitPrice` (`priceAtTime` mirrors final) |
| `Transaction` | `globalDiscountPercentage`, `totalDiscountAmount` |

## API

`POST /api/v1/transactions` accepts optional:

- `globalDiscountPercentage` on the request
- `itemDiscountPercentage` per line in `items[]`

Response includes discount fields on the transaction and each line item.

## Tests

- `DiscountPricingTest` — pure cascade math, exclusion, mixed cart
- `TransactionServiceImplTest` — integration with mixed eligible/excluded lines, item+global on same line, validation

## Follow-ups

- Frontend discount UI (not in scope for Feature 015)
- Customer-specific / tier pricing beyond percentage discounts (still pending)
