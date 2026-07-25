# Feature 067 — Backend customer payment tender

## Status

**Done** — `paymentMethod` CASH|CARD on balance payments; CASH creates shift PAY_IN for expected cash.

## Summary

Extend `POST /customers/{id}/payments` with required `paymentMethod`. Persist on ledger. Require OPEN shift. CASH → drawer PAY_IN; CARD → ledger only (external terminal).

## Unlocks

FE **068** customer pay modal.
