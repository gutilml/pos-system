# Implementation Plan - Frontend Pay Modal Layout Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse:

```http
POST /api/v1/transactions
```

with Feature 013 `payments[]`. Do not alter `useCartStore.addPayment` exact-remaining clamp or `selectCanCompleteSale` exact-total rule unless a layout bug forces a pure UI fix.

## Frontend Architecture

### Starting point (Feature 036 already ships)

* `CheckoutModal.tsx` — Grand total / Remaining / Tendered, CREDIT gate, PAY + Print and pay.
* `TenderInputArea.tsx` — method toggle buttons, amount field, Add tender, remaining clamp errors.
* `PaymentTenderList.tsx` — listed tenders with Remove.

### Polish work

* Reorder / restyle sections in `CheckoutModal` and `TenderInputArea` to match the review mock more closely (method row prominence, totals pairing, spacing). Prefer CSS/structure changes over new state.
* Ensure selecting a method does not auto-post a tender; amount + Add (or equivalent confirm) still required — unless the mock explicitly uses a different confirm pattern; keep one explicit add step to avoid accidental double-tenders.
* Confirm Remaining `data-testid="checkout-balance-due"` updates after add/remove (existing selectors).
* Keep Print and pay visually secondary (outline / smaller flex) vs primary PAY.

### What not to rewrite

* No revival of overpay change UI.
* No footer Card shortcut.
* No Stripe QR on CARD.

### Tests

* Extend `CheckoutModal.test.tsx` / `TenderInputArea` coverage only where layout changes risk regressions; retain exact Remaining = 0 enablement and overpay error cases from 036.

## Additional Considerations

* Ship last in the 038→041 polish wave so sell-screen density work lands before modal visual tweaks.
* If mock and current UI already match functionally, limit the PR to spacing/labels/hierarchy — still close the pending item with an intentional pass documented in README.
* FE/BE separation: no Java changes.
