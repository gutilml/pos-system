# Feature: Frontend Products Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Move product and category admin out of the CashierMenu **Catalog** modal into the Products workspace. Under Products, provide ticket-level sub-tabs **Product** and **Category**. Reuse `ProductEditorForm`, `CategoryPanel`, and `ParentPackageModal` from Feature **053**. Feature **056** will replace the Product-tab discoverability model with scan/type load-or-create; **055** must deliver a non-modal Products workspace and remove the modal entry.

## User Stories

* As a cashier, I want Products as a workspace (not a modal) so I can manage catalog without covering the whole POS in a dialog.
* As a cashier, I want Product and Category sub-tabs under Products so category work stays one click away and future sub-areas can extend the same tab strip.
* As a cashier, I no longer want a Catalog item in the Cashier menu once the Products workspace exists.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature **054** workspace shell; Feature **053** admin components/APIs; Features **050**/**051** backends (already Done).
* **Out of scope:** Backend changes; lookup load-or-create heuristic (**056**); Customer/Inventory real screens; role gating; changing Register/Sell sell flow.

## UX & Business Rules

### Products workspace

* Selecting **Products** in workspace nav shows Products chrome (not Sell cart).
* Sub-tabs (ticket-level / strip similar density to `TicketTabs`): **Product** | **Category**.
* Default sub-tab: **Product**.
* Sub-tab strip is extensible (more tabs later without redesigning the shell).

### Category tab

* Render `CategoryPanel` (create/edit/list as in **053**).
* Keep EN/ES via existing `admin.*` keys; add workspace chrome keys if needed.

### Product tab (055)

* Migrate useful UI from `CatalogAdminModal` products side: open `ProductEditorForm` for create/edit; inventory gate via `enableInventory`; parent incomplete popup still works.
* List + “New product” is acceptable in **055**; Feature **056** replaces discovery with lookup load-or-create (may remove or demote the filter list).

### Remove modal entry

* Remove Catalog menu item and `CatalogAdminModal` open state from `CashierMenu`.
* Remove or stop shipping `CatalogAdminModal` as a dialog wrapper (prefer extracting shared body into Products workspace components rather than keeping a dead modal).
* Update CashierMenu locale tests that assert `cashier.catalog` / `catalog-menu-item`.

## Acceptance Criteria

1. [x] Products workspace shows sub-tabs **Product** and **Category** (default Product).
2. [x] Category tab renders working `CategoryPanel` CRUD against existing category APIs.
3. [x] Product tab can create/edit products via `ProductEditorForm` (050 fields, inventory gated, parent package popup still works).
4. [x] CashierMenu no longer opens a Catalog modal; `catalog-menu-item` / CatalogAdminModal primary path removed.
5. [x] AuthGate / ShiftGate / workspace nav from **054** unchanged in responsibility.
6. [x] EN/ES for new Products sub-tab chrome; existing admin strings reused where possible.
7. [x] Vitest: Products sub-tab switch; Category panel still mounts; CashierMenu has no Catalog entry.
8. [x] Pending frontend + `docs/README.md` updated for Feature **055**.
