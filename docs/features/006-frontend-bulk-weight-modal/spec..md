# Specification: Feature 006 - Frontend Bulk & Weight Input Modal

## Objective
Implement an interception mechanism during the checkout flow. When a cashier scans or selects a product marked with `sellByWeight = true`, the system must halt adding the item to the cart and instead present a touch-friendly modal to capture the precise weight or fractional quantity.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript).
* **State Interception:** Update the Zustand `useCartStore` to handle an "interrupted" state, temporarily holding the scanned product until the weight is confirmed.
* **Hardware Integration:** Implement a basic Web Serial API utility to read data directly from a connected scale if the cashier presses a "Read Scale" button.

## UX & Business Rules
* **Touch-Friendly Numpad:** The modal must contain large, easy-to-tap numeric buttons (0-9, decimal point, backspace) for touchscreens.
* **Unit Awareness:** The modal must display the product's defined `unitOfMeasure` (e.g., "grams", "ml") to provide context to the cashier.
* **Graceful Fallback:** If the Web Serial API fails to connect to a scale (or the browser lacks support), the cashier must seamlessly fall back to using the manual touchscreen numpad.