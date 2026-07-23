# Feature 047 — Frontend Pay Popup Three Amount Fields (Option A)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — three always-visible CASH / CARD / CREDIT amount fields; live Remaining; no Add tender / tender list; CREDIT customer gate on blur.

## Behavior

* Always-visible **CASH**, **CARD**, and **CREDIT** amount fields (one editable amount per method).
* No **Add tender**; no tender list.
* Remaining = grand total − sum of the three fields; updates live on every change.
* No overpay; **PAY** / **Print and pay** only when Remaining = 0.
* Empty/0 = method unused; POST at most one `payments[]` entry per used method.
* CREDIT amount &gt; 0 on **blur** opens customer-assign popup (not on focus alone).

## Key files

* `frontend/src/store/useCartStore.ts` (`upsertPayment`)
* `frontend/src/components/checkout/TenderAmountFields.tsx`
* `frontend/src/components/checkout/CheckoutModal.tsx`
* Removed: `TenderInputArea.tsx`, `PaymentTenderList.tsx`
* Vitest: cart upsert + CheckoutModal flows

## Depends on / follow-ups

* Depends on: Features **036** (exact cover / CREDIT customer), **041** (layout chrome), **013/014** (`payments[]`).
* Related polish: UI locale gaps (customer popup, New Ticket, Stock→Inv) tracked separately in pending frontend.
