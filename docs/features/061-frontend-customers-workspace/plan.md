# Implementation Plan - Frontend Customers Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Frontend Architecture

* Expand `api/customers.ts` (search empty-q, get, create, update, delete, ledger, pay).
* `AuthUser.enableCustomerCredit` from `/me`.
* `CustomersWorkspace` mounted from `RegisterScreen` for `customers`.
* `AssignCustomerControl` idle label → `customer.assignTitle` (or dedicated key with same copy).

## Tests

Workspace load/filter/credit-hide; assign button label; customers API empty-q fetch.
