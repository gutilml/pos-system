# Feature 105 — Pay Modal: CASH Prefill + Change Display

## Status

**Done** — CASH field pre-filled with grand total on Pay open; cashier may enter a higher amount; read-only Change row shows amount to return to customer.

## Behavior

| Scenario | Before | After |
|----------|--------|-------|
| Open Pay modal | CASH blank, PAY disabled | CASH = grand total, PAY enabled immediately |
| Exact cash sale | Cashier had to type full total | Just click PAY |
| Customer gives more (e.g. $50 for a $48.50 sale) | Not possible (blocked as overpay) | Type `50` in CASH → Change row shows `$1.50` |
| Split pay (CARD $20 + CASH rest) | CASH auto-fills remaining after CARD is entered | Same; Change shows any overage |
| CARD / CREDIT | Still capped at remaining balance | Unchanged |

## Rules

- **CASH** is the only tender that may exceed the remaining balance.
- **Change** = `max(0, sum(all tenders) − grand total)`. Displayed in a green chip below the CASH field only when > 0. Read-only, not editable.
- **PAY** enabled when `totalTendered >= grandTotal` (was exact match).
- Backend `changeGiven` field is already computed server-side and was already accepting overpay.

## Key Files

- `frontend/src/store/useCartStore.ts` — `upsertPayment`: CASH skips the max-cap guard; `selectCanCompleteSale`: `<` instead of `!==`.
- `frontend/src/components/checkout/TenderAmountFields.tsx` — `grandTotal` prop; Change chip after CASH field; overpay error suppressed for CASH.
- `frontend/src/components/checkout/CheckoutModal.tsx` — `useEffect` prefills CASH on open when no payments exist.
- `frontend/src/i18n/messages.ts` — `checkout.change` / `checkout.change` (ES: Cambio).
- Tests: `CheckoutModal.test.tsx` (9 tests), `useCartStore.test.ts` (14 tests).
