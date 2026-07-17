# Feature 013 — Backend Split Payment Refactor

## What it does

A single sale can now be settled with multiple tenders at once (e.g. $200 CASH + $300 CREDIT). The singular `payment_type` column on `transactions` is gone; each tender is a row in the new `transaction_payments` table.

## Architecture

### Data model

- **`TransactionPayment`** (`com.pos.core.models`) — `id`, `transaction` (ManyToOne, required), `paymentMethod` (`CASH` / `CARD` / `CREDIT` via the existing `PaymentType` enum), `amount` (`DECIMAL(12,4)`).
- **`Transaction`** — dropped `paymentType`; added `List<TransactionPayment> payments` with `cascade = ALL, orphanRemoval = true` and an `addPayment(...)` helper that keeps both sides of the relation in sync. `amount_received` and `change_given` remain as derived totals (sum of tenders / cash change).
- Schema reference updated in `docs/database-schema.sql` (table 10).

### API contract

`POST /api/v1/transactions` now takes:

```json
{
  "storeId": "…",
  "items": [{ "productId": "…", "quantity": 1.0 }],
  "payments": [
    { "paymentMethod": "CASH", "amount": 200.0 },
    { "paymentMethod": "CREDIT", "amount": 300.0 }
  ],
  "taxRate": 0.0825,
  "customerId": "… (required when any payment is CREDIT)"
}
```

`payments` is `@NotEmpty`; each entry needs a method and a positive amount. The response echoes the persisted tenders as `payments[]` (id, method, amount) alongside the usual totals. This is a breaking change: `amountReceived` and `paymentType` are no longer accepted on the request.

### Service rules (`TransactionServiceImpl`)

All math is `BigDecimal`, scale 4, `HALF_UP`:

1. Totals are always recomputed server-side from catalog prices — client amounts are never trusted for line items.
2. Payments are summed with `reduce(BigDecimal::add)`. If the sum is **less** than `grand_total`, the sale is rejected (`BusinessRuleException`).
3. Overpayment is allowed only from cash: the non-cash portion (CARD + CREDIT) must not exceed `grand_total`, so change is never given against a card or a tab.
4. `change_given = totalPayments − grandTotal`; `amount_received = totalPayments`.
5. Any `CREDIT` tender requires a `customerId`. After the transaction is saved, `CustomerCreditService.chargeAccount(...)` is invoked **per CREDIT tender with that tender's exact amount** — never the full grand total — so the ledger and credit-limit check (Feature 012) see only the portion actually put on the tab.

## Testing

- `TransactionServiceImplTest` — exact-math happy path, catalog-price trust, split CASH+CREDIT charging only the credit portion, rejection when payments sum short, CREDIT without `customerId`, non-cash overpayment, empty payment list, non-positive amounts.
- `TransactionControllerTest` — 201 with `payments[]` in the response; 400 when the request omits `payments`.
- `TransactionInventoryIntegrationTest` — updated to the new request shape; inventory gating unchanged.

## Follow-ups (tracked in `docs/pending feature/`)

- Frontend must switch `createTransaction` to the `payments[]` payload before cash checkout wiring lands.
- Stripe Checkout still charges the full transaction total; CARD tenders inside a split are recorded locally but not routed through Stripe.
