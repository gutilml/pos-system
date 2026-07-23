# Feature: Frontend Pay Modal Redesign & Print and Pay

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Simplify the selling-screen footer and Pay modal so all tendering (including CARD) happens in one place, with strict no-overpay rules and a **Print and pay** action that finishes the sale, prints a browser sell ticket, and returns the cashier to a ready register for the next customer.

## User Stories

* As a cashier, I want a single **Pay** entry point (no footer Card) so all splits go through one modal.
* As a cashier, I want to split the current sale across CASH, CARD, and CREDIT without being able to over-tender or invent change from overpay.
* As a cashier, I want CREDIT to require a customer, and I want to cancel that path and use another method if needed.
* As a cashier, I want **Print and pay** to complete the sale, print the ticket, and leave me ready for the next client.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Existing `POST /api/v1/transactions` with `payments[]` (Features 013/014); CARD = mark paid / external terminal (023).
* **Out of scope:** Stripe session/QR; hardware receipt printers; Feature 037 sell-screen customer assign UI (CREDIT assign-at-pay may keep using existing `CustomerSearch` in the modal); dedicated customer credit ledger / tab pay-down screens.

## UX & Business Rules

### Footer (`CheckoutFooter`)

* Remove **Card** button and `handleCardPayment` shortcut.
* Keep Clear + **Pay** (opens checkout modal).
* Footer may still show assigned customer if present (from prior CREDIT or future 037).

### Pay modal

* Show grand total, remaining, tendered.
* **No over-tender:** each added tender amount must be ≤ remaining balance; reject/clamp higher amounts; do not show change-from-overpay. Completion requires tenders summing **exactly** to grand total (within money rounding).
* Methods: CASH, CARD, CREDIT available for the **current sale** (split allowed). Prefer ordered entry guidance: start with CASH, then CARD, then CREDIT as needed (soft UX — method buttons remain selectable; do not hard-block out-of-order if product allows any order as long as totals are exact).
* CREDIT without customer → intercept with `CustomerSearch` (existing). Clearing customer / removing CREDIT tender abandons the credit path.
* Primary action label **PAY** (replace “Complete Transaction”) — POST transaction, close ticket, close modal, ready register.
* Secondary **Print and pay** — same POST success path, then show/print sell ticket via `window.print` (Feature 024 pattern), then dismiss to ready register (new empty/active ticket as today after `closeTicket`).
* Cancel clears tenders (existing) and closes without posting.

### Print content

* Sell ticket: store/register-appropriate summary — line items, totals, tender breakdown, customer if any, timestamp. Browser print only; `@media print` hide chrome.

## Acceptance Criteria

1. [ ] Footer has no Card shortcut; Pay opens the modal.
2. [ ] Cashier can split one sale across CASH, CARD, and CREDIT via `payments[]`.
3. [ ] Tender amounts cannot exceed remaining; UI does not offer change from over-tender; PAY enabled only when remaining is 0 and rules satisfied.
4. [ ] CREDIT requires an assigned customer; cashier can remove CREDIT / clear customer and continue with other methods.
5. [ ] **PAY** posts `COMPLETED` transaction, closes ticket, returns to register.
6. [ ] **Print and pay** posts successfully, invokes print of sell ticket, then returns to ready register.
7. [ ] CARD portions remain external-terminal mark-paid (no Stripe QR on this path).
8. [ ] Vitest covers no-overpay, CREDIT gate, PAY success, Print and pay calling `window.print`.
9. [ ] Pending Pay redesign / Print and pay / overlapping receipt items note Feature 036; `docs/README.md` updated.
