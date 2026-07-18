# Plan: Feature 023 - Frontend External-Terminal CARD (Mark Paid on Pay)

## Backend Architecture

None. Transaction `payments[]` with `CARD` + `COMPLETED` already exists (Features 013/014). Stripe backend (Feature 010) stays untouched / on hold.

## Frontend Architecture

### `CheckoutFooter.tsx`
* Remove happy-path wiring to `StripePaymentModal` for the Card button.
* Implement chosen Card behavior (open Pay modal, or complete full CARD sale without Stripe).
* Drop or ignore `onRequestCardPayment` prop if it only existed for Stripe QR — simplify `RegisterScreen` accordingly.

### `RegisterScreen.tsx`
* Remove or stop using `requestCardPayment` that POSTs then expects Stripe QR.
* If Card completes immediately: POST `payments: [{ paymentMethod: 'CARD', amount: grandTotal }]` with discounts/customer as today, then clear/close ticket on success.

### `CheckoutModal.tsx`
* Confirm CARD tenders already flow through `createTransaction` — no Stripe branch to remove unless one was added.
* Optional microcopy: CARD means external terminal (only if it stays unobtrusive).

### Preserve (do not delete)
* `components/checkout/StripePaymentModal.tsx` (+ tests)
* `api/paymentApi.ts` (+ tests)

## Additional Considerations

* Decision recorded 2026-07-17 in pending docs: external terminal; mark paid on Pay; keep Stripe code.
* Do **not** plan Phase A work for Stripe session, QR, IN_PROGRESS-for-Stripe, or status polling.
* Update pending frontend CARD item; leave Stripe hold notes intact on backend/frontend pending lists.
