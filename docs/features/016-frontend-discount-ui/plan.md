# Plan: Feature 016 - Frontend Discount UI & Visual Math

## Phase 1: State Management Refactor
Update `src/store/useCartStore.ts`:
* Add `globalDiscountPercentage` (number, default 0) to the Ticket state.
* Add `itemDiscountPercentage` (number, default 0) to the `CartItem` type.
* Update the derived state (getters) to calculate the subtotal, total discount amount, and grand total using the cascading math logic:
  1. Base Item Price = `price * (1 - (itemDiscountPercentage / 100))`
  2. Eligible Cart Subtotal = Sum of Base Item Prices where `!product.excludeFromGlobalDiscounts`
  3. Global Discount Amount = `Eligible Cart Subtotal * (globalDiscountPercentage / 100)`
  4. Grand Total = (Total of all Base Item Prices) - Global Discount Amount + Tax.

## Phase 2: UI Components
Update `src/components/register/`:
* `CartItemRow.tsx`: Add an inline input or popover to set `itemDiscountPercentage`. Add visual strikethrough for discounted prices and the exclusion badge.
* `CheckoutFooter.tsx`: Add an input field for the `globalDiscountPercentage`. Display the total `Discount Saved` value clearly.

## Phase 3: Integration
* Ensure the Checkout Modal maps the new discount percentages correctly into the `TransactionRequestDTO` when submitting to the backend.

## Phase 4: Testing & Backlog Grooming
* Write Vitest tests for `useCartStore` verifying the cascading math matches the backend logic perfectly (especially testing carts with mixed eligible/excluded items).
* **Grooming:** Read `docs/pending_features/frontend.md` and remove/resolve any bullet points mentioning UI discounts.