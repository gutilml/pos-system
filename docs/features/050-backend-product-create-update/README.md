# Feature 050 — Backend Product Create/Update Catalog Fields

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — create/update APIs, margin hierarchy, parent package validation, inventory gating.

## Summary

Extend product **create** and add full **update** so catalog operators can set barcodes (0..N), name/description, unit vs bulk, parent link, cost, margin hierarchy, retail + wholesale prices, inventory fields (when store inventory enabled), and parent package unit/qty. Derive child cost from parent; keep price ↔ margin bidirectional.

## Depends on / unlocks

* Builds on: 003 create, 027 multi-SKU, 042 stock flags, 045 store preferences.
* Unlocks: **051** categories CRUD (margin defaults), **052** parent stock deduction, **053** admin UI.

## Out of scope

* Admin SPA (053); parent stock deduction on checkout (052); org-level tables (store `preferences.default_margin` stands in until org exists); role-gated permissions (everyone authenticated for now).
