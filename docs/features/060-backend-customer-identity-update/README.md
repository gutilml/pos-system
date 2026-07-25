# Feature 060 — Backend Customer Identity Update

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — list (empty-q), get/update/delete, identity CRUD ungated from credit; `enableCustomerCredit` on `/me`.

## Summary

Support a Customers workspace that works even when store credit is off: list/search/create/update/get/delete customers without `enable_customer_credit`. Keep ledger and pay-down credit-gated. Expose `enableCustomerCredit` on auth user DTO. Hard-delete only when `currentBalance == 0`.

## Depends on / unlocks

* Builds on: Features **012**, **019**.
* Unlocks: Frontend **061** Customers workspace.

## Out of scope

* Frontend UI (**061**); soft delete; tender type on pay-down; role gating.
