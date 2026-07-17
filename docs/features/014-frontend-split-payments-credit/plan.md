# Plan: Feature 014 - Frontend Split Payments & Customer Credit UI

## Phase 1: State Management Updates
Refactor `src/store/useCartStore.ts` (or create `usePaymentStore.ts`):
* Add `payments: Array<{ method: 'CASH' | 'CARD' | 'CREDIT', amount: number }>` to the Ticket state.
* Add `customerId: string | null` to the Ticket state.
* Create derived state/getters: `totalTendered` and `balanceDue`.

## Phase 2: UI Components
Create new components in `src/components/checkout/`:
* `CheckoutModal.tsx`: The main wrapper containing the logic.
* `PaymentTenderList.tsx`: Displays the current rows of applied payments.
* `TenderInputArea.tsx`: A numpad or input field to select a payment method and amount.
* `CustomerSearch.tsx`: An autocomplete input that searches the backend for customers (`GET /api/v1/customers/search`) and displays their name and credit limit.

## Phase 3: Integration & Payload Formatting
* Wire the "Complete Transaction" button to map the local state into the new `TransactionRequestDTO` format established in Feature 013 (sending an array of payments and the `customerId`).
* Call the backend `POST /api/v1/transactions` API.

## Phase 4: Testing & Backlog Grooming
* Write frontend tests for the math logic: ensuring `balanceDue` accurately updates as tenders are added, and that the submit button is properly disabled/enabled.
* **Grooming:** Read `docs/pending_features/frontend.md` and remove/resolve any bullet points mentioning split payments, customer assignment, or credit UI.