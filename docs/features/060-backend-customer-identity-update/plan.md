# Implementation Plan - Backend Customer Identity Update

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

* `CustomerRepository`: `findByStoreIdOrderByNameAsc(storeId, pageable)` for empty-q list.
* `CustomerCreditService`: get/update/delete; remove credit gate from create/search; keep on ledger/pay/charge.
* `UpdateCustomerRequestDTO`: name, phone, creditLimit.
* `TransactionRepository`: clear customer FK before delete; `CreditLedgerEntryRepository.deleteByCustomerId`.
* `AuthService.toResponse`: mirror inventory flag pattern for `enable_customer_credit`.

## Tests

Service + controller + AuthService `/me` flag coverage.
