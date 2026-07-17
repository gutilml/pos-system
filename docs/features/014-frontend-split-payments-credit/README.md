# Feature 014 — Frontend Split Payments & Customer Credit UI

## What it does

Register checkout now opens a **Pay** modal where cashiers can stack multiple tenders (CASH / CARD / CREDIT) against the grand total. Choosing **CREDIT** without a ticket customer forces an inline customer search that shows available credit before the tender is accepted. Completing the sale POSTs Feature 013’s `payments[]` (+ optional `customerId`) payload.

## Architecture

### State (`useCartStore`)

Per ticket:

- `payments: PaymentTender[]` — `{ id, method, amount }`
- `customer: AssignedCustomer | null` — id, name, phone, creditLimit, currentBalance

Selectors: `selectTotalTendered`, `selectBalanceDue`, `selectTenderChangeDue`, `selectAvailableCredit`, `selectCanCompleteSale` (requires tenders ≥ grand total, and a customer whenever any tender is CREDIT). Persist version bumped to **3** with a migrate that fills missing `payments` / `customer`.

### UI (`src/components/checkout/`)

- `CheckoutModal` — totals, tender list, tender input, credit interception, Complete Transaction
- `PaymentTenderList` / `TenderInputArea` / `CustomerSearch`
- `CheckoutFooter` — **Pay** opens the modal; **Card** remains the Stripe QR path (full-ticket CARD payment)

### API

- `transactions.createTransaction` now sends `{ payments: [{ paymentMethod, amount }], customerId?, items, taxRate, storeId }`
- `customers.searchCustomers(q)` → `GET /api/v1/customers/search?q=` (backend endpoint still pending — UI is ready and tested with mocks)

## Tests

- Store tender math / can-complete gating
- CheckoutModal: disabled until covered, CREDIT interception + customer assign, successful `payments[]` POST
- CheckoutFooter: Pay opens modal
