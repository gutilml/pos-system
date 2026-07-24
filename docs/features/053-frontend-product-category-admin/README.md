# Feature 053 — Frontend Product & Category Admin UI

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Cashier menu → Catalog modal: products + categories, parent package popup, EN/ES.

## Summary

Admin (and for now all authenticated users) SPA screens to create/update products and manage categories, including:

* Form fields from Feature 050
* Bidirectional margin ↔ retail price
* Inventory section only if `enableInventory`
* Popup when linking bulk child to parent missing package unit/qty
* Category CRUD UI for Feature 051

## Depends on

* BE **050**, **051**; stock deduction **052** needs no UI beyond accurate stock display.

## Out of scope

* Role-gated admin-only nav (permissions later); Stripe; org picker.
