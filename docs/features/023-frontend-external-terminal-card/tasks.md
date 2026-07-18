# Tasks: Feature 023 - Frontend External-Terminal CARD (Mark Paid on Pay)

## Backend Tasks

- None (Stripe APIs remain on hold; no deletions).

## Frontend Tasks

- [ ] 1. Change `CheckoutFooter` Card button so it does not open `StripePaymentModal` or start Checkout Sessions.
- [ ] 2. Simplify `RegisterScreen` card helper: either remove Stripe-oriented `onRequestCardPayment` or make Card complete a `COMPLETED` CARD sale without QR.
- [ ] 3. Verify `CheckoutModal` CARD + Complete Transaction path posts `payments[]` and clears the ticket (no Stripe).
- [ ] 4. Keep `StripePaymentModal` / `paymentApi` files in repo; update footer tests to assert Stripe is not invoked.
- [ ] 5. Document behavior in `docs/features/023-frontend-external-terminal-card/README.md`.
- [ ] 6. Mark CARD external-terminal item done in `docs/pending feature/frontend.md` (Feature 023); confirm Stripe hold notes remain.

## Test Tasks

- [ ] 7. CheckoutFooter / RegisterScreen tests: Card path does not call `createCheckoutSession`; Pay+CARD still posts transaction.
