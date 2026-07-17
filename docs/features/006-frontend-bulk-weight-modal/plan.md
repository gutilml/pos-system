# Plan: Feature 006 - Frontend Bulk & Weight Input Modal

## Phase 1: State Management Updates
Update `src/store/useCartStore.ts`:
* Add `pendingWeightProduct` to the store state (holds the product currently waiting for weight input).
* Modify the `addItem` action: if `product.sellByWeight === true`, set `pendingWeightProduct` and abort adding to the cart array.
* Add `confirmWeight(quantity: number)`: pushes the `pendingWeightProduct` to the cart with the confirmed weight and clears the pending state.

## Phase 2: Hardware Utility
Create `src/utils/serialScaleHelper.ts`:
* Create an async function `requestScaleWeight()` using the browser's native `navigator.serial` API.
* Prompt the user for port connection, read the stream, parse the numeric value, and close the port.

## Phase 3: UI Components
Create `src/components/register/WeightModal.tsx`:
* Build a fixed overlay modal using Tailwind CSS (z-index high, dark transparent background).
* Implement the UI: Display Product Name, a large text input for the current weight, a custom touch numpad grid, and a "Read from Scale" button.
* Hook the "Confirm" button to `useCartStore.confirmWeight()`.

## Phase 4: Main View Integration & Testing
* Add `<WeightModal />` to the root level of `RegisterScreen.tsx`. It should conditionally render only if `pendingWeightProduct` is not null.
* Write Vitest/React Testing Library tests mocking the `addItem` interception logic and testing the numpad click behavior.