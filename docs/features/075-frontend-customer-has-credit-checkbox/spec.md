# Feature: Frontend customer has-credit checkbox

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Let cashiers mark whether a customer may use store credit without always showing a limit field.

## User Stories

* As a cashier, I want to create a customer without credit by unchecking Has credit.
* As a cashier, I want to enable credit and set a limit when needed.

## Scope

* **Strictly Frontend:** [`CustomersWorkspace.tsx`](../../../frontend/src/features/admin/CustomersWorkspace.tsx) (+ i18n, tests, docs).
* Only when `enableCustomerCredit` is true on the store (existing gate).

## UX & business rules

1. Checkbox **Has credit** / **Con crédito** on create and edit when store credit enabled.
2. Unchecked: hide credit limit; save with `creditLimit: 0`; hide ledger/pay (already gated by enable + edit — keep balance/ledger only when credit enabled **and** has credit / limit or balance as today).
3. Checked: show credit limit field (existing).
4. Edit load: checked if `creditLimit > 0` **or** `currentBalance > 0` (do not leave tab customers without credit UI).
5. Unchecking with outstanding balance: block or confirm — **block save** with message if `currentBalance > 0` (safer default).

## Acceptance Criteria

1. [x] Checkbox gates limit field and save limit 0 when off.
2. [x] Edit precheck rules + block uncheck with balance.
3. [x] Vitest + EN/ES + pending/catalog when Done.
