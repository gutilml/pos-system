# Feature 023 — Frontend External-Terminal CARD (Mark Paid on Pay)

## Status

**Planned** (Phase A). Stripe-in-POS remains **ON HOLD**.

## Intent

* Cashier takes card on a separate terminal.
* CARD tenders + **Pay / Complete** → `COMPLETED` sale with `payments[]` including CARD.
* Do not open Stripe QR; do not delete Stripe client/API code (Features 010/011 kept for later).
