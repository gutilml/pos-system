# Feature: Backend Customer Identity Update

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Extend customer APIs so identity CRUD and listing work without the credit feature flag, while ledger and payments remain credit-gated. Add get-by-id, update, and hard delete (balance must be zero). Expose `enableCustomerCredit` on login/`/me`.

## User Stories

* As a cashier, I want to list and edit customers even when credit is disabled so the Customers workspace can grow toward rewards later.
* As a cashier, I want to delete a customer only when they owe nothing.
* As the SPA, I need `enableCustomerCredit` on `/me` to hide credit UI when off.

## Scope

* **Strictly Backend:** `backend/`, feature/pending docs, `docs/README.md`.
* **Depends on:** 012, 019.
* **Out of scope:** FE (**061**); soft delete; changing pay-down tender rules.

## API & business rules

1. `GET /customers/search?storeId=&q=` — blank `q` returns up to 20 store customers by name; non-blank filters name/phone (max 20). **No** credit gate.
2. `POST /customers` — create without credit gate (`creditLimit` still required; use `0` when credit off).
3. `GET /customers/{id}` — customer DTO; no credit gate.
4. `PUT /customers/{id}` — update name, phone, creditLimit; store immutable; no credit gate.
5. `DELETE /customers/{id}` — hard delete only if `currentBalance == 0`; else business rule error. Clear ledger rows and null `transactions.customer_id` before delete.
6. Ledger + payments — keep `enable_customer_credit` gate.
7. `UserResponseDTO` — add `enableCustomerCredit` from store features.

## Acceptance Criteria

1. [x] Empty-q search lists up to 20 customers without credit flag.
2. [x] Create/update/get work with credit off; ledger/pay still require credit on.
3. [x] Delete succeeds at zero balance; fails with outstanding balance.
4. [x] `/me` and login include `enableCustomerCredit`.
5. [x] Tests + pending + catalog updated.
