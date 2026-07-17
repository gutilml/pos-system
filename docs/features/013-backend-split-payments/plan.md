# Plan: Feature 013 - Backend Split Payment Refactor

## Phase 1: Data Model Updates
* Create `TransactionPayment.java` in `src/main/java/com/pos/core/models/`:
  * Fields: `id`, `transaction` (ManyToOne), `paymentMethod` (Enum: CASH, CARD, CREDIT), `amount` (BigDecimal).
* Update `Transaction.java`:
  * Remove the single `paymentMethod` field.
  * Add `List<TransactionPayment> payments` with a One-to-Many cascade.

## Phase 2: DTO & API Updates
* Refactor `TransactionRequestDTO` to accept a `List<PaymentRequestDTO>` instead of a single payment string.
* Ensure the DTO allows sending `customerId` if required by the payment type.

## Phase 3: Service Layer Logic
Refactor `TransactionService.java`:
* Loop through the incoming `PaymentRequestDTO` list.
* Use `BigDecimal.reduce(BigDecimal::add)` to sum the payments.
* Verify `totalPayments >= grandTotal`.
* For any payment where `paymentMethod == CREDIT`, invoke `CustomerCreditService.chargeAccount(...)` for that specific amount.

## Phase 4: Testing & Backlog Grooming
* Refactor all broken unit tests that previously relied on a single payment method.
* Write new tests specifically for:
  * A successful Split Payment (Cash + Credit).
  * A rejected transaction where the sum of payments is less than the total.
* **Grooming:** Read `docs/pending_features/backend.md` and remove/resolve any bullet points mentioning split payments.