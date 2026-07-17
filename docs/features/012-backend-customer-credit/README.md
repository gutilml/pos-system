# Feature 012 — Backend Customer Credit (Store Tab)

## Overview

Opt-in customer credit module: trusted shoppers can charge sales to a tab (up to a `creditLimit`) and pay the balance down later. Every balance change is recorded in `credit_ledger_entries`.

## Feature flag

All customer credit APIs and `CREDIT` checkout require:

```text
store.features["enable_customer_credit"] == true
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/customers` | Register customer (`storeId`, `name`, `phone`, `creditLimit`) |
| `GET` | `/api/v1/customers/{id}/ledger` | Charge/payment history |
| `POST` | `/api/v1/customers/{id}/payments` | Pay down tab (`amount`) |

Checkout: `POST /api/v1/transactions` with `paymentType: "CREDIT"` and `customerId` charges `grandTotal` to the tab (writes a CHARGE ledger entry). Cash still requires `amountReceived >= grandTotal`.

## Credit limit rule

```text
projected = scale4(currentBalance + charge)
if projected > creditLimit → CreditLimitExceededException
```

Equal to the limit is allowed. Payments cannot exceed `currentBalance`.

## Package layout

`com.pos.customers` — models, repositories, DTOs, `CustomerCreditService`, `CustomerController`
