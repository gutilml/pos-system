# Spec — 067

## Acceptance Criteria

1. [x] Request requires amount + CASH|CARD.
2. [x] Ledger stores payment_method on PAYMENT.
3. [x] CASH → PAY_IN on open shift; CARD no PAY_IN.
4. [x] Reject without open shift / CREDIT method / overpay.
5. [x] Migration + tests + pending + catalog.
