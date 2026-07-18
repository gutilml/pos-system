# Tasks: Feature 020 - Frontend Customer Search Live Wire-Up

## Backend Tasks

- None. Requires Feature 019 for E2E.

## Frontend Tasks

- [x] 1. Update `searchCustomers` in `api/customers.ts` to include `storeId` query param (default `DEFAULT_STORE_ID`).
- [x] 2. Smoke-check `CustomerSearch` + `CheckoutModal` credit assignment against the new client signature.
- [x] 3. Update Vitest mocks/assertions for `storeId`.
- [x] 4. Document in `docs/features/020-frontend-customer-search-wireup/README.md`.
- [x] 5. Mark `GET /api/v1/customers/search` wire-up done in `docs/pending feature/frontend.md` (Feature 020).

## Test Tasks

- [x] 6. Assert fetch URL includes both `storeId` and `q`; selection still maps to `AssignedCustomer`.
