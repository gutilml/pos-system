# Specification: Feature 013 - Backend Split Payment Refactor

## Objective
Refactor the backend data model and transaction processing engine to support split payments. A single transaction must now be capable of receiving multiple payment methods (e.g., $200 CASH and $300 CREDIT) simultaneously.

## Scope
* **Strictly Backend:** No frontend code.
* **Database Refactor:** Remove the singular `payment_type` from the `Transaction` entity. Introduce a new `TransactionPayment` entity linked via a One-to-Many relationship.
* **Backlog Management:** Review and update `docs/pending_features/backend.md` to check off or remove items related to split payments or multiple payment methods.

## Business Rules & Technical Constraints
* **Payment Validation:** The `TransactionService` must ensure that the sum of all `TransactionPayment` amounts exactly equals (or exceeds, in the case of cash change) the transaction's `grand_total`. If it is less, the transaction must be rejected.
* **Credit Routing:** If the array of payments includes a `CREDIT` type, the service must verify that a `customerId` is attached to the transaction and then trigger the `CustomerCreditService` to deduct that specific partial amount from their limit.
* **Precision:** All summation and validation MUST use `BigDecimal`.