# Feature 011 — Frontend Stripe UI & Payment Polling

## Overview

Cashiers start a card payment from the register; a modal shows a QR code of the Stripe Checkout URL. The UI polls transaction status every 3s until the webhook marks the sale `COMPLETED`, then closes the active ticket.

## Key pieces

| Piece | Role |
|-------|------|
| `src/api/paymentApi.ts` | `createCheckoutSession`, `getTransactionStatus` |
| `src/api/transactions.ts` | `createTransaction` to obtain a backend tx id before checkout |
| `StripePaymentModal` | Loading → QR (`PAYMENT_PENDING`) → Success → `closeTicket` |
| `CheckoutFooter` Card button | Calls `onRequestCardPayment`, then opens the modal |
| Vite `/api` proxy | Dev proxy to `localhost:8080` |

## Dependencies

- Backend: `POST /payments/checkout/{id}`, webhook → `COMPLETED`
- Backend follow-up: `GET /transactions/{id}/status` (client already calls it)
- Card path expects an `IN_PROGRESS` transaction before checkout (see Feature 010 pending)
