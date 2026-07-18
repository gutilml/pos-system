# Plan: Feature 020 - Frontend Customer Search Live Wire-Up

## Backend Architecture

None. Contract from Feature 019.

## Frontend Architecture

### API — `frontend/src/api/customers.ts`
* Extend `searchCustomers(query, storeId = DEFAULT_STORE_ID)` (import store id from `api/shifts` or a shared constant module if preferred — match existing DEFAULT_STORE_ID usage).
* Build query string with both `storeId` and `q`.

### UI — `CustomerSearch.tsx`
* No major UX rewrite; ensure it continues to use `searchCustomers`.
* Confirm error/empty/loading states still work with live failures.

### Tests
* Update any mocks/expectations that assumed `q` only.
* Keep `CheckoutModal` CREDIT interception tests green.

## Additional Considerations

* Feature 014 shipped UI ahead of backend; this feature closes that gap without expanding credit product scope.
* Update `docs/pending feature/frontend.md` accordingly.
