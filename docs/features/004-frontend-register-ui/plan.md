# Plan: Feature 004 - Frontend Core Register UI

## Phase 1: State Management (Zustand)
Create `src/store/useCartStore.ts`:
* Manage a list of `CartItem` objects (product, quantity, price).
* Implement actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
* Implement computed getters (or derived state) for `subtotal`, `taxTotal`, and `grandTotal`.

## Phase 2: Core UI Components
Create reusable components in `src/components/register/`:
* `SearchBar.tsx`: Top input field for barcodes/names.
* `CartItemRow.tsx`: Displays name, quantity controls (+/-), and line total.
* `CheckoutFooter.tsx`: Displays totals, handles the auto-select logic for the "Amount Received" input, and calculates exact "Change Due".

## Phase 3: The Main View
Create `src/features/register/RegisterScreen.tsx`:
* Assemble the components into a responsive, full-height flexbox layout using Tailwind CSS. 
* Ensure the cart area is scrollable while the header and footer remain fixed.

## Phase 4: Testing
* Use Vitest and React Testing Library.
* Write tests for `useCartStore` to verify math accuracy.
* Write component tests for `CheckoutFooter` to ensure the auto-select and change-due calculations work correctly.