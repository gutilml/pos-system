# Feature 055 — Frontend Products Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Products workspace with Product|Category sub-tabs; CashierMenu Catalog modal removed.

## Behavior

* Products workspace replaces the 054 Products stub.
* Sub-tabs: Product | Category (ticket-strip style).
* Category: `CategoryPanel`. Product: list + New product + `ProductEditorForm` (056 replaces list with lookup).
* Remove Catalog from CashierMenu; delete `CatalogAdminModal`.

## Key files

* `frontend/src/features/admin/ProductsWorkspace.tsx`
* `frontend/src/features/register/RegisterScreen.tsx`
* `frontend/src/components/shift/CashierMenu.tsx`
