# Feature 036 — Frontend Pay Modal Redesign & Print and Pay

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Footer **Card** shortcut removed — CARD only inside Pay.
* Split **CASH / CARD / CREDIT**; tender cannot exceed remaining; PAY requires exact total.
* CREDIT customer gate can be abandoned (**Back — choose another tender**).
* Primary **PAY**; secondary **Print and pay** (POST → `SaleTicket` + `window.print` → ready for next sale).

## Key files

* `CheckoutFooter.tsx`, `CheckoutModal.tsx`, `TenderInputArea.tsx`, `SaleTicket.tsx`, `useCartStore.ts`
