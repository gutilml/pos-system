# Feature: Frontend Pay Popup Three Amount Fields (Option A)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Redesign the Pay modal so cashiers enter split tenders via three always-visible amount fields — **CASH**, **CARD**, and **CREDIT** — instead of method toggle + Add tender + tender list. Remaining updates live as `grand total − sum(fields)`. Overpay is blocked. **PAY** / **Print and pay** enable only when Remaining is exactly 0. Empty or zero means that method is unused. On submit, the client posts at most one `payments[]` entry per method for non-zero amounts. CREDIT still requires an assigned customer (Feature 036), but the assign popup opens when the cashier finishes entering a CREDIT amount &gt; 0 (blur / leave field), not merely by selecting CREDIT.

## User Stories

* As a cashier, I want CASH, CARD, and CREDIT amounts always visible so I can split a sale without adding/removing tender rows.
* As a cashier, I want Remaining to update as I type so I always know what is left to cover.
* As a cashier, I want PAY blocked until Remaining is 0 and I cannot enter amounts that overpay the grand total.
* As a cashier, I want the customer-assign popup only when I actually put money on CREDIT, so I can fill CASH/CARD without interruption.
* As a cashier, I want unused methods (empty/0) omitted from the POST so the wire stays one payment per used method.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature 036 exact-cover / no-overpay / PAY + Print and pay / CREDIT customer rule; Feature 041 layout chrome; Features 013/014 `payments[]` (`CASH` | `CARD` | `CREDIT`).
* **Out of scope:** Backend/API changes; Stripe QR revival; inventing change-from-overpay; hardware printers; new payment methods; auto-filling Remaining into a single field on open; UI locale coverage polish (customer popup / New Ticket / Stock→Inv — separate pending item).

## UX & Business Rules

### Layout

* Always show three labeled amount inputs: **CASH**, **CARD**, **CREDIT** (wire method codes unchanged).
* Remove **Add tender** and the tender list (`PaymentTenderList`).
* Keep Grand total + Remaining prominent (Feature 041). Tendered line may remain as the sum of the three fields or be dropped if redundant — prefer keep for continuity unless layout is crowded.
* Keep Cancel, secondary **Print and pay**, primary **PAY**.

### Live Remaining & no overpay (Option A)

* Each field is **the** amount for that method (replace, do not stack multiple tenders of the same method).
* `Remaining = roundMoney(grandTotal − (cash + card + credit))`, recalculated whenever any field changes.
* Sum of the three parsed amounts must never exceed grand total (within money rounding). Reject or clamp the edited field so it cannot push the sum above grand total; show a clear inline error if reject.
* Empty / invalid / `0` ⇒ treat that method as **0** (unused).

### Complete sale

* **PAY** / **Print and pay** enabled only when Remaining = 0 **and** Feature 036 CREDIT rules pass (if CREDIT amount &gt; 0, customer must be assigned).
* On submit: build `payments[]` with **at most one** entry per method among `{CASH, CARD, CREDIT}` for amounts &gt; 0 after `roundMoney`. Do not send zero/empty methods.
* POST shape, Print and pay → `SaleTicket` / `window.print`, Cancel → clear tenders / close: unchanged from 036.

### CREDIT customer gate

* Do **not** open the customer gate merely because focus moves to CREDIT or a CREDIT label is clicked.
* When cashier finishes entering CREDIT with amount &gt; 0 (blur / leave field) and no customer is assigned → show existing customer-assign UI (`CustomerSearch` / credit gate).
* Keep amount in the CREDIT field while assigning; on assign, keep CREDIT amount and dismiss gate.
* Abandon path remains (“Back — choose another tender”): dismiss gate; cashier may clear CREDIT to 0 and continue with other methods.
* If customer already assigned (e.g. Feature 037), do not re-prompt on CREDIT blur.
* Clearing customer while CREDIT &gt; 0 re-blocks complete until reassigned or CREDIT set to 0.

## Acceptance Criteria

1. [x] Pay modal shows three always-visible amount fields labeled CASH, CARD, and CREDIT; no Add tender control; no tender list.
2. [x] Remaining equals grand total minus the sum of the three fields and updates live on each field change.
3. [x] Entering values whose sum would exceed grand total is rejected or clamped; UI does not allow overpay.
4. [x] Empty or 0 in a field means that method is unused; PAY / Print and pay stay disabled until Remaining = 0.
5. [x] With Remaining = 0 and no CREDIT (or CREDIT with customer), PAY posts `payments[]` with at most one entry per used method (`CASH` | `CARD` | `CREDIT`) and non-zero amounts only.
6. [x] CREDIT amount &gt; 0 on blur without customer opens the assign-customer popup; focusing CREDIT alone does not.
7. [x] Abandon / clear-customer / clear-CREDIT-to-0 paths still allow completing with other methods under Feature 036 rules.
8. [x] Print and pay still posts then prints; Cancel clears method amounts and closes without posting.
9. [x] Vitest covers live Remaining, overpay block, exact-cover enablement, CREDIT blur gate, one-payment-per-method POST, Print and pay `window.print`.
10. [x] Pending frontend + `docs/README.md` catalog/topic updated for Feature 047.
