# Feature 053 — Frontend Product & Category Admin UI

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — shipped Cashier menu → **Catalog modal** (products + categories, parent package popup, EN/ES).

**Superseded for navigation UX** by Features **054–056** (workspace shell → Products workspace → lookup load-or-create). Keep **053** components (`ProductEditorForm`, `CategoryPanel`, `ParentPackageModal`) as the reuse base; do not extend the modal as the long-term catalog entry.

## Summary

Admin (and for now all authenticated users) SPA screens to create/update products and manage categories, including:

* Form fields from Feature 050
* Bidirectional margin ↔ retail price
* Inventory section only if `enableInventory`
* Popup when linking bulk child to parent missing package unit/qty
* Category CRUD UI for Feature 051

Shipped as a **modal** from `CashierMenu`. Follow-on redesign (not a rewrite of 050/051 APIs):

* **054** — workspace nav under the Register header
* **055** — Products workspace Product|Category tabs; remove Catalog modal entry
* **056** — Product tab scan/type load-or-create with barcode/name prefill

## Depends on

* BE **050**, **051**; stock deduction **052** needs no UI beyond accurate stock display.

## Out of scope

* Role-gated admin-only nav (permissions later); Stripe; org picker.
* Workspace chrome / non-modal Products UX — see **054–056**.
