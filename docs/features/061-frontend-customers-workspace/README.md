# Feature 061 — Frontend Customers Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Customers workspace list/create/edit/delete; credit sections gated; Register Assign customer label.

## Summary

Replace the Customers “coming soon” placeholder with a workspace: list on load (max 20), filter via search, detail form for create/edit/delete. When `enableCustomerCredit`, show limit, balance, ledger (date sort toggle), and amount-only pay-down. Rename Register idle assign button to Assign customer / Asignar cliente.

## Depends on / unlocks

* Depends on: Backend **060**, workspace shell **054**.
* Unlocks: inventory workspace still pending; customer rewards later.

## Out of scope

* Assign-to-sale from this workspace; tender split on pay; inventory workspace; role gating.
