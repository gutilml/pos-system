# Feature: Backend closed tickets + reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers need to review past COMPLETED sales and reimburse all or part of a ticket when the sale was paid with CASH and/or CREDIT. Returned quantities must restock. CARD sales cannot be reimbursed in this feature.

## User Stories

* As a cashier, I want to list closed tickets for the store so I can find a sale to reimburse.
* As a cashier, I want to return selected lines/qty and put stock back.
* As a cashier, I want cash refunds to reduce expected drawer cash and credit refunds to reduce the customer balance.

## Scope

* **Strictly Backend:** `backend/` (+ schema/migration, feature/pending docs, `docs/README.md`).
* **Depends on:** existing transactions, inventory deduction (**052**), shifts/drawer, customer credit.
* **Unlocks:** FE **073**.

## APIs

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/transactions?storeId=` | COMPLETED sales for store, newest first |
| `GET` | `/api/v1/transactions/{id}` | Detail: lines, payments, returnable qty per line |
| `POST` | `/api/v1/transactions/{id}/reimburse` | Body: lines `{ transactionItemId, quantity }` (empty/all remaining = full remaining) |

## Business rules

1. Reimburse only `COMPLETED` tickets.
2. If any payment method is **CARD** → reject (pending feature).
3. Track returned qty so partial reimbursements cannot over-return (e.g. `returned_quantity` on items or equivalent).
4. Partial: each line qty must be `1…returnable`.
5. Restore stock for returned qty (reverse parent-package rules from **052**).
6. Refund money for returned merchandise value (post-discount line share as used at sale — document exact formula in implementation).
7. Mixed CASH+CREDIT (no CARD): apply refund **CASH first** up to remaining refundable cash on the ticket, remainder to **CREDIT**.
8. CASH portion → open-shift **PAY_OUT**; require OPEN shift.
9. CREDIT portion → decrease customer balance + ledger entry (e.g. `REFUND`) with locale description snapshot (**069** style).
10. List is **all store** tickets for now (no cashier filter).

## Acceptance Criteria

1. [x] List/get COMPLETED transactions by store.
2. [x] Full and partial reimburse with stock restore.
3. [x] CARD blocked; CASH PAY_OUT; CREDIT balance + ledger.
4. [x] Over-return rejected; tests + migration + pending/catalog when Done.
