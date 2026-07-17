# Feature 010 — Backend Stripe Checkout Integration

## Overview

Card payments via Stripe Checkout Sessions (MXN). The backend creates a hosted Checkout Session for an `IN_PROGRESS` / `HELD` transaction and completes it when Stripe sends a verified `checkout.session.completed` webhook.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/payments/checkout/{transactionId}` | Create Checkout Session; returns `sessionId` + `checkoutUrl` |
| `POST` | `/api/v1/payments/webhook` | Raw JSON body + `Stripe-Signature`; verifies signature then applies events |

## Money → cents

`StripeMoney.toCents(BigDecimal)` multiplies by 100 with `HALF_UP` scale 0, then `longValueExact()`. The session charges `unit_amount` from `transaction.grandTotal` in currency `mxn`.

## Config

```yaml
stripe:
  api-key: ${STRIPE_API_KEY}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET}
  success-url: ...
  cancel-url: ...
```

## Notes

- Checkout requires transaction status `IN_PROGRESS` or `HELD` (cash `POST /transactions` still creates `COMPLETED` directly).
- `payment_method_types` is omitted so Stripe dynamic payment methods apply.
- Webhook idempotently ignores already-`COMPLETED` transactions.
