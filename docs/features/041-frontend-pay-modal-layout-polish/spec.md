# Feature: Frontend Pay Modal Layout Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Align the Pay modal’s visual layout closer to the 2026-07-23 review mock while keeping Feature 036 tender rules intact: method choices CASH / CARD / CREDIT, amount entry for the selected method, Remaining decreasing as each tender is added, PAY enabled only at exact cover (Remaining = 0, no overpay), and Print and pay as a secondary action.

## User Stories

* As a cashier, I want the Pay screen to match the reviewed mock (method buttons + Grand total / Remaining hierarchy) so split tenders feel obvious under pressure.
* As a cashier, I want PAY disabled until Remaining is exactly zero so I cannot complete an under- or over-tendered sale.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 036 (Pay redesign, no overpay, PAY / Print and pay, CREDIT gate); Features 013/014 `payments[]`.
* **Out of scope:** Changing `addPayment` / `selectCanCompleteSale` exact-cover math (already 036); Stripe QR revival; footer Clear/Discount/Pay (038–040); inventing change-from-overpay; hardware printers.

## UX & Business Rules

### Preserve from Feature 036 (do not regress)

* Methods: CASH, CARD, CREDIT selectable for the current sale (splits allowed).
* Tender amount cannot exceed Remaining; reject/clamp with clear error.
* `selectCanCompleteSale` / PAY / Print and pay require Remaining = 0 (exact total within money rounding).
* CREDIT still requires an assigned customer; abandon path remains.
* CARD remains external-terminal mark-paid semantics inside the modal.

### Layout polish (this feature)

* Emphasize method buttons as the primary choice control (CASH / CARD / CREDIT), with amount entry clearly applying to the **selected** method.
* Keep Grand total and Remaining prominent; Remaining must visibly update after each successful Add tender / remove tender.
* Prefer mock-aligned hierarchy: totals header → method choices → amount → tender list → actions (exact order may match mock; adjust spacing/labels/visual weight without new business rules).
* Primary **PAY**; secondary **Print and pay**; Cancel unchanged.
* Soft guidance (copy or order) may prefer CASH → CARD → CREDIT; do not hard-block method order.

## Acceptance Criteria

1. [ ] Modal presents CASH / CARD / CREDIT as method choices; entered amount applies to the selected method.
2. [ ] Remaining updates after each tender add/remove and equals grand total minus tendered (Feature 036 selectors).
3. [ ] PAY (and Print and pay) enabled only when Remaining = 0 and existing CREDIT/customer rules pass; overpay still blocked.
4. [ ] Print and pay remains secondary to PAY (visual weight / placement).
5. [ ] No change to transaction POST shape (`payments[]`, discount fields, external CARD semantics).
6. [ ] Vitest still covers exact cover, overpay rejection, CREDIT gate; add/adjust layout assertions only as needed (e.g. method selection → add).
7. [ ] Pending “Pay modal layout (split tenders)” notes Feature 041 triad path; `docs/README.md` updated.
