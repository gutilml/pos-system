# Implementation Plan - Frontend Footer Totals Total Only

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Tax continues to apply in `selectGrandTotal` / transaction `taxRate` as today.

## Frontend Architecture

### `CheckoutFooter.tsx`

* Stop computing/displaying `subtotal` and `taxTotal` in the footer UI (may drop unused `selectSubtotal` / `selectTaxTotal` imports if nothing else needs them in this component).
* Keep `grandTotal` and conditional `discountSaved` rows; Total remains the emphasized figure.
* Leave Clear / Pay / global discount block / customer chip unchanged (040 owns discount relocation).

### Tests — `CheckoutFooter.test.tsx`

* Assert `queryByText('Subtotal')` / `queryByText('Tax')` are null.
* Keep Pay open, empty-cart disable, no Card, and discount-saved + reduced Total coverage.

## Additional Considerations

* Prefer shipping after 038 (cart chrome) and before 040 so footer height shrinks in two clear steps.
* Do not invent a “Tax included” footnote unless product later asks — pending item only requires Total (+ Discount when useful).
* FE/BE separation: no Java changes.
