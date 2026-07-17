# Plan: Feature 011 - Frontend Stripe UI & Payment Polling

## Phase 1: Dependencies & API Integration
* Install a QR code library (e.g., `qrcode.react`).
* Create frontend API calls in `src/api/paymentApi.ts`:
  * `createCheckoutSession(transactionId)`: Calls `POST /api/v1/payments/checkout/{transactionId}`.
  * `getTransactionStatus(transactionId)`: Calls `GET /api/v1/transactions/{transactionId}/status`.

## Phase 2: UI Components
Create `src/components/checkout/StripePaymentModal.tsx`:
* **Loading State:** Shows a spinner while fetching the session URL.
* **QR State:** Renders the `<QRCodeCanvas>` with the Stripe URL. Includes a "Cancel" button.
* **Success State:** Displays a green checkmark/success animation when polling confirms payment.

## Phase 3: The Polling Mechanism
* Inside `StripePaymentModal.tsx`, implement a `useEffect` that sets up a `setInterval`.
* Every 3000ms, call `getTransactionStatus`. 
* If status === 'COMPLETED', clear the interval, trigger the success UI state, wait 2 seconds, then call `useCartStore.closeTicket(activeTicketId)` and close the modal.

## Phase 4: Testing & Backlog Grooming
* Write tests mocking the API calls to verify the modal transitions from Loading -> QR -> Success based on the polling response.
* **Grooming:** Read `docs/pending_features/frontend.md` and remove/resolve any bullet points mentioning Stripe UI, QR codes, or digital payments.