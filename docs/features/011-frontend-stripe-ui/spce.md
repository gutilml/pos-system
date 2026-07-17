# Specification: Feature 011 - Frontend Stripe UI & Payment Polling

## Objective
Implement the frontend user interface for processing Stripe payments. Instead of redirecting the cashier's browser, the UI will display a QR code containing the Stripe Checkout URL for the customer to scan. The frontend will poll the backend to detect when the payment succeeds.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript).
* **Payment State:** Update the UI to handle a `PAYMENT_PENDING` and `PAYMENT_SUCCESS` state. 
* **Backlog Management:** Review and update `docs/pending_features/frontend.md` to check off or remove items related to payment gateways, QR codes, or Stripe UI integration.

## UX & Business Rules
* **QR Code Generation:** The modal must take the Stripe `session_url` returned from the backend and generate a scannable QR code on the screen.
* **Auto-Resolution (Polling):** While the QR code modal is open, the frontend must poll the backend transaction status endpoint every 3 seconds. Once the backend reports `COMPLETED` (triggered by the Stripe Webhook), the modal must automatically close, show a success message, and clear the active ticket.
* **Manual Cancel:** The cashier must have a button to cancel the digital payment and return to the cart if the customer changes their mind and wants to pay cash.