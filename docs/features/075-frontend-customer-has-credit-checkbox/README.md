# Feature 075 — Frontend customer has-credit checkbox

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Has-credit checkbox gates limit/ledger/pay; `creditLimit: 0` when unchecked.

## Summary

When store customer credit is enabled, customer create/edit shows a **Has credit** checkbox. Unchecked → credit limit treated as 0 and limit field hidden. Checked → show credit limit. No new BE column (`creditLimit = 0` means no credit).

## Out of scope

* Store-level `enableCustomerCredit` changes; dedicated `hasCredit` DB flag.
