# Tasks: Feature 019 - Backend Customer Search API

## Backend Tasks

- [x] 1. Add store-scoped name/phone search method on `CustomerRepository`.
- [x] 2. Implement `searchCustomers(storeId, q)` on `CustomerCreditService` / `CustomerCreditServiceImpl` returning `List<CustomerDTO>`.
- [x] 3. Expose `GET /api/v1/customers/search` on `CustomerController` with required `storeId` and `q`.
- [x] 4. Add controller + service tests (match, other-store exclusion, blank `q` → `[]`).
- [x] 5. Document contract in `docs/features/019-backend-customer-search/README.md`.
- [x] 6. Mark Customer search API done in `docs/pending feature/backend.md` (Feature 019).

## Frontend Tasks

- None.

## Test Tasks

- [x] 7. `@WebMvcTest(CustomerController.class)` for `/search`; service unit tests for query trimming and mapping.
