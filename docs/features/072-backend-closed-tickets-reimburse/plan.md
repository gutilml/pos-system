# Plan — 072 Backend closed tickets + reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Schema: track returnable qty (e.g. `transaction_items.returned_quantity`); optional ledger type `REFUND`.
2. Repository queries for COMPLETED by `storeId` ordered by time desc.
3. `TransactionService`: list, get, reimburse orchestration (validate CARD, compute refund, stock, drawer, credit).
4. Controller endpoints under `/api/v1/transactions`.
5. JUnit for cash-only, credit-only, mixed, partial, CARD reject, over-return, stock restore.
6. Mark triad Done; unlock FE **073**.
