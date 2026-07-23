# Task Checklist — Feature 047 Frontend Pay Popup Three Amount Fields

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add `upsertPayment(method, amount)` (at most one row per method; zero removes; clamp/reject vs other methods + grand total) in `useCartStore.ts`; update checkout call sites away from append-style `addPayment` for this flow.
- [x] 2. Implement three always-visible amount fields (replace `TenderInputArea` interaction; remove Add tender). Prefer new `TenderAmountFields.tsx` or equivalent rewrite under `frontend/src/components/checkout/`.
- [x] 3. Update `CheckoutModal.tsx`: drop `PaymentTenderList`; live Remaining from store selectors; CREDIT customer gate on CREDIT blur when amount &gt; 0; keep PAY / Print and pay / Cancel / `SaleTicket` paths.
- [x] 4. Delete unused tender-list UI if nothing else imports it (`PaymentTenderList.tsx`); clean i18n keys (`checkout.addTender` / `checkout.noTenders`) or leave unused only if shared — prefer remove from maps when unused.
- [x] 5. Document README triad; append/promote pending frontend item; update `docs/README.md` topic + catalog for 047.

## Test Tasks

- [x] 6. Vitest `useCartStore`: upsert replace, zero-clear, overpay guard, `selectCanCompleteSale` with CREDIT customer rule.
- [x] 7. Vitest `CheckoutModal`: three fields → live Remaining; overpay blocked; PAY only at Remaining 0; CREDIT blur gate + abandon; POST ≤1 payment per method; Print and pay calls `window.print`.
