# Specification: Feature 020 - Frontend Customer Search Live Wire-Up

## Objective
Point the existing `CustomerSearch` / `searchCustomers` client at the live Feature 019 API with correct store scoping, so credit assignment at checkout works against real customers.

## Scope
* **Strictly Frontend:** Only `frontend/` changes.
* **Depends on:** Feature 019 `GET /api/v1/customers/search`.
* **Out of scope:** Dedicated credit ledger/pay-down screens, creating customers from the register.

## UX & Business Rules
* `CustomerSearch` already debounces and calls `searchCustomers`; keep that UX.
* Client must send `storeId` (use `DEFAULT_STORE_ID` until auth/store picker exists) plus `q`.
* Map numeric JSON fields to money helpers as today (`creditLimit`, `currentBalance`).
* Surface API errors in the existing error slot; empty results show “No customers found.”
* Do not mock the search endpoint in production code paths (tests may still mock).

## Acceptance Criteria
1. [ ] `searchCustomers` calls `/api/v1/customers/search?storeId=…&q=…`.
2. [ ] Selecting a result still assigns `AssignedCustomer` for CREDIT tenders in `CheckoutModal`.
3. [ ] Blank query does not hit the network (or returns [] without error) — preserve current guard.
4. [ ] Component/API tests updated for the `storeId` contract.
5. [ ] Pending frontend item for customer search marked done when verified against live API (or noted Feature 020).
