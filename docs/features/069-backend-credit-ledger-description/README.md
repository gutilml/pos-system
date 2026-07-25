# Feature 069 — Backend credit ledger description locale snapshot

## Status

**Done** — `description` stored on ledger rows from store `ui_locale` at write time.

## Summary

CHARGE/PAYMENT entries persist a human `description` (e.g. `Payment · Cash` / `Pago · Tarjeta`) using the store language when the movement is created. Switching locale later does not rewrite old rows.

## Unlocks

FE **070** display of stored description / Movements label.
