# Feature 072 — Backend closed tickets + reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done**

## Summary

List/get COMPLETED store transactions and reimburse full or partial lines (CASH / CREDIT only). Restore inventory; CASH → shift PAY_OUT; CREDIT → reduce customer balance + ledger. Reject if any CARD tender (CARD refunds pending). All tickets for now; cashier-owned filter later.

## Refund money formula

Money scale **4 HALF_UP**. Quantity scale **4**.

For each returned line:

- `merchRefund = lineTotal × (returnQty / quantity)` (scale 4 HALF_UP)

Across the ticket:

- `effectiveTaxRate = taxTotal / subtotal` if `subtotal > 0`, else `0`
- `R = merchRefundSum × (1 + effectiveTaxRate)` (scale 4 HALF_UP)
- Equivalent: `R = merchRefundSum + taxTotal × (merchRefundSum / subtotal)` when subtotal &gt; 0

### Allocation across partial reimbursements (CASH first)

No extra columns — derived from payments + cumulative `returned_quantity`:

- `cashNet = Σ CASH amounts − changeGiven`
- `creditTotal = Σ CREDIT amounts` (informational; remainder after cash)
- `R_prior` = refund amount implied by **current** `returned_quantity` on all lines (same formula as `R`)
- `cashAlready = min(R_prior, cashNet)`; `creditAlready = R_prior − cashAlready`
- For this request’s `R`: `cashPortion = min(R, cashNet − cashAlready)`; `creditPortion = R − cashPortion`

- CASH portion &gt; 0 → require OPEN shift; `ShiftService.addDrawerEvent` **PAY_OUT** reason `Ticket reimburse: {id}`
- CREDIT portion &gt; 0 → `CustomerCreditService.refundAccount` (reject if amount &gt; balance); ledger type **REFUND**

## APIs

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/transactions?storeId=` | COMPLETED sales for store, newest first |
| `GET` | `/api/v1/transactions/{id}` | Detail with `returnedQuantity` / `returnableQuantity` per line |
| `POST` | `/api/v1/transactions/{id}/reimburse` | Body lines `{ transactionItemId, quantity }`; empty/omit lines = all remaining |

## Migration

`docs/migrations/072-transaction-returned-quantity.sql` — `transaction_items.returned_quantity`

## Unlocks

FE **073**.

## Out of scope

* CARD reimbursements; cashier-only filter; Stripe refunds; hold/void lifecycle beyond reimburse.
