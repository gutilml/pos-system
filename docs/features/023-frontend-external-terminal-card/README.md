# Feature 023 — Frontend External-Terminal CARD (Mark Paid on Pay)

## Status

**Done** — Phase A. Stripe-in-POS remains **ON HOLD** (code kept).

## Behavior

* **Card** button: after the cashier charges an external terminal, click Card → `POST` transaction with `payments: [{ CARD, grandTotal }]` → close ticket. **No** Stripe QR / Checkout Session.
* **Pay** modal: CARD tenders still complete via Feature 014 `createTransaction` (same mark-paid model).
* `StripePaymentModal` / `paymentApi` remain in the repo for a later opt-in path.
