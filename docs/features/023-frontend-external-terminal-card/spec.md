# Specification: Feature 023 - Frontend External-Terminal CARD (Mark Paid on Pay)

## Objective
Align register card sales with the small-store decision: card is taken on a **separate physical terminal**. Cashiers record CARD tenders and mark the sale paid on **Pay / Complete Transaction**. Do **not** drive Stripe Checkout / QR for this path. Keep Stripe client code in the repo for a later opt-in revival.

## Scope
* **Strictly Frontend:** Only `frontend/` changes.
* **Stripe policy:** ON HOLD — do not delete `paymentApi.ts`, `StripePaymentModal`, or related tests; stop requiring them for CARD sales.
* **Out of scope:** Backend Stripe API changes, `IN_PROGRESS` transaction revival, `GET /transactions/{id}/status` polling, split-pay Stripe sessions.

## UX & Business Rules
* In `CheckoutModal`, CARD tenders behave like CASH for completion: on **Complete Transaction**, `POST /api/v1/transactions` with `payments[]` including `CARD` and status `COMPLETED` (existing Feature 013/014 path).
* Footer **Card** button must **not** open `StripePaymentModal` or call `createCheckoutSession`.
* Preferred Card-button behavior (pick one and keep it small): either (a) open `CheckoutModal` ready for CARD, or (b) complete a full-ticket CARD sale via `createTransaction` + clear cart **without** Stripe QR. Prefer (b) only if it stays a thin change to `RegisterScreen` / `CheckoutFooter`; otherwise (a).
* No cashier-facing copy that implies in-POS Stripe QR is required.
* Do not remove Stripe modules from the codebase.

## Acceptance Criteria
1. [ ] Completing checkout with one or more CARD tenders persists via existing `createTransaction` and closes the ticket; no Stripe session is created.
2. [ ] Footer Card path no longer opens `StripePaymentModal` / does not call `createCheckoutSession`.
3. [ ] `StripePaymentModal`, `paymentApi.ts`, and their unit tests remain in the tree (unused by the happy path).
4. [ ] Updated component tests assert Card/Pay CARD flow does not invoke Stripe APIs.
5. [ ] Pending frontend “CARD tender = mark paid” item marked done (Feature 023); Stripe hold notes remain clear.
