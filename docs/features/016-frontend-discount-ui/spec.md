# Specification: Feature 016 - Frontend Discount UI & Visual Math

## Objective
Implement the UI controls for cashiers to apply item-level and cart-level percentage discounts. The frontend state must accurately replicate the backend's cascading discount math to provide real-time total updates.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript, Tailwind).
* **State Management:** Update `useCartStore` to calculate the cascading discounts (Item-level first, then Global-level on eligible items only).
* **Backlog Management:** Review and update `docs/pending_features/frontend.md` to check off items related to applying discounts, UI pricing, or promotions.

## UX & Business Rules
* **Visual Price Adjustments:** If an item is discounted, the UI must show the original price with a strikethrough next to the new discounted price.
* **Exclusion Badge:** If a product in the cart has `excludeFromGlobalDiscounts = true`, the UI must display a small visual indicator (e.g., a "No Global %" badge) so the cashier understands why a global discount isn't affecting that item.
* **Discount Inputs:** 
  * Add a `%` button/input on each cart item row.
  * Add a `Global Discount %` input in the Checkout Footer area.
* **Payload Formatting:** The final API payload must include the `itemDiscountPercentage` on each item and the `globalDiscountPercentage` on the main transaction body.