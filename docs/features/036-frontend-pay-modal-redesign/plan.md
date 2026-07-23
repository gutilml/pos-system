# Implementation Plan - Frontend Pay Modal Redesign & Print and Pay

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse:

```http
POST /api/v1/transactions
```

with Feature 013 `payments[]` and optional `customerId` when CREDIT is present. CARD tender = paid in full on complete (external terminal), same as Feature 023 semantics inside the modal.

## Frontend Architecture

### Footer — `CheckoutFooter.tsx`

* Delete Card button, `cardStarting` / `cardError` / `handleCardPayment`.
* Keep Pay → `CheckoutModal`.

### Tender rules — `useCartStore.ts` + `TenderInputArea.tsx`

* In `addPayment` (or before): clamp/reject if `amount > selectBalanceDue(...)` (after `roundMoney`).
* `selectCanCompleteSale`: require `selectTotalTendered === selectGrandTotal` (not `>=`); keep CREDIT ⇒ customer rule.
* Remove or stop displaying `selectTenderChangeDue` overpay change in `CheckoutModal` (change always 0 under new rules). Exact cash with no overpay means no drawer change line on the sell ticket unless a future decision reintroduces under/over — **out of scope to invent change**.

### Modal UX — `CheckoutModal.tsx`

* Rename primary button to **PAY**.
* Add secondary **Print and pay** sharing the same POST helper; on success set local `lastSaleReceipt` payload (items/totals/payments snapshot **before** `closeTicket`), then open printable ticket component and `window.print()`, then clear and close.
* Preserve CREDIT interception via `CustomerSearch`; ensure Clear customer / remove CREDIT tender exits require-customer mode without forcing a sale.

### Printable sell ticket

* New component e.g. `components/checkout/SaleTicket.tsx` modeled on `ShiftCloseTicket` (print CSS + Print button + Done).
* **Print and pay** may auto-invoke `window.print()` once on success; still allow Done to dismiss.

### Tests

* Update `CheckoutFooter.test` / `CheckoutModal.test` / cart store tests for exact tender, removed Card, print path (`vi.spyOn(window, 'print')`).

## Additional Considerations

* Prefer implementing after Feature 033 so ticket money strings are 2 dp.
* Feature 037 can pre-assign customer on the ticket; modal should respect existing `customer` without forcing re-search.
* Do not revive Stripe QR (011) on CARD.
* Overlapping pending “Receipt / print” items are satisfied for the **pay** path by this feature; standalone reprint of historical transactions remains out of scope.
* FE/BE separation: no Java changes.
