# Specification: Feature 019 - Backend Customer Search API

## Objective
Provide a store-scoped customer search endpoint so the register credit flow can look up customers by name or phone and receive credit limit + balance for available-credit UI.

## Scope
* **Strictly Backend:** No frontend code.
* **Module:** `com.pos.customers` (extends Feature 012).
* **Out of scope:** Customer create/ledger/payment changes, multi-tier pricing, dedicated credit pay-down screens.

## Business Rules & Technical Constraints
* Endpoint: `GET /api/v1/customers/search?storeId={uuid}&q={text}`.
* Search is **store-scoped** (customers belong to a store via `Customer.store`).
* Match `name` and/or `phone` with case-insensitive partial match on the query string (trim empty → empty list, not error).
* Response items must include at least: `id`, `storeId`, `name`, `phone`, `creditLimit`, `currentBalance` (align with existing `CustomerDTO` / frontend `CustomerSearchResult`).
* Respect modular monolith / opt-in philosophy: this is a read API for the customers module; do not invent new credit rules here.
* Limit result size (e.g. top 20) to keep autocomplete snappy.

## Acceptance Criteria
1. [x] `GET /api/v1/customers/search?storeId=…&q=…` returns 200 and a JSON array of matching customers.
2. [x] Results are limited to the given `storeId`.
3. [x] Name and phone partial matches work (case-insensitive).
4. [x] Empty/blank `q` returns `[]` (200), not 400.
5. [x] Missing `storeId` returns 4xx validation error.
6. [x] JUnit/WebMvc + service/repository tests cover match, store isolation, and empty query.
