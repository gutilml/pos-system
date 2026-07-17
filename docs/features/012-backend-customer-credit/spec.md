# Specification: Feature 012 - Backend Customer Credit (Store Tab) Engine

## Objective
Implement the backend architecture for a customer credit system. This module allows trusted customers to "charge it to their tab" (creating a debt) and make partial or full payments against that balance later.

## Scope
* **Strictly Backend:** No frontend code.
* **Feature Toggle:** This entire module must be gated by a `enable_customer_credit` boolean inside the `StoreSettings` JSONB configuration.
* **Backlog Management:** Review and update `docs/pending_features/backend.md` to check off or remove items related to customer accounts, tabs, IOUs, or credit limits.

## Business Rules & Technical Constraints
* **Credit Limits:** Every customer must have a defined `credit_limit`. The system must strictly block any transaction that would push their `current_balance` over this limit.
* **Ledger System:** Do not just update a balance column. The system must create a `CreditLedgerEntry` for every action (a charge or a payment) to maintain a perfect audit trail of why a balance changed.
* **Financial Precision:** All balances, limits, and ledger amounts MUST use `BigDecimal`.
* **Transaction Integration:** A standard POS `Transaction` can now have a `PaymentType` of `CREDIT`, which links to a specific `Customer`.