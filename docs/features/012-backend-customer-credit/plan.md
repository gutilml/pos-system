# Plan: Feature 012 - Backend Customer Credit (Store Tab) Engine

## Phase 1: Data Layer Updates
Create entities in `src/main/java/com/pos/customers/models/`:
* `Customer.java`: Fields for name, phone, `creditLimit`, and `currentBalance` (both `BigDecimal`).
* `CreditLedgerEntry.java`: Fields for `customerId`, `transactionId` (nullable, if they are just paying down their tab), `amount`, and `type` (CHARGE or PAYMENT).

## Phase 2: Service Layer
Create `CustomerCreditService.java`:
* `chargeAccount(customerId, amount, transactionId)`: Verifies `enable_customer_credit` is true. Checks if `currentBalance + amount > creditLimit`. If safe, creates a CHARGE ledger entry and updates balance.
* `payBalance(customerId, amount)`: Creates a PAYMENT ledger entry and reduces the balance.

## Phase 3: REST Controllers
Create `CustomerController.java`:
* `POST /api/v1/customers`: Register a new customer.
* `GET /api/v1/customers/{id}/ledger`: Fetch the history of charges and payments.
* `POST /api/v1/customers/{id}/payments`: Submit a payment against the tab.

## Phase 4: Testing & Backlog Grooming
* Write unit tests for `CustomerCreditService` to verify the `BigDecimal` math and ensure the `CreditLimitExceededException` is thrown correctly.
* **Grooming:** Read `docs/pending_features/backend.md` and remove/resolve any bullet points mentioning customer tabs, IOUs, or credit ledgers.