# Feature: Frontend Product Lookup Load-or-Create

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Make the Products → Product tab **lookup-first**: scan or type a code/name, then either load the matching product into `ProductEditorForm` or open create mode with the query prefilled into barcodes or name based on a barcode heuristic. This finishes the post-053 catalog redesign for product editing without backend changes.

## User Stories

* As a cashier, I want to scan a barcode on the Product tab so an existing product opens for edit immediately.
* As a cashier, I want an unknown barcode to open a new-product form with that barcode already filled so I can finish create quickly.
* As a cashier, I want a name search that is not barcode-like to prefill the name when nothing matches so create still starts from what I typed.
* As a cashier, I still want the parent-package incomplete popup when linking a child to an incomplete parent.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature **055** Product tab shell; `searchProducts` (**021**/**022**); `ProductEditorForm` (**053**); create/update APIs (**050**).
* **Out of scope:** Backend/API changes; Category tab changes; Customer/Inventory workspaces; changing register sell `SearchBar` behavior; role gating.

## UX & Business Rules

### Lookup field

* Prominent scan/type input on Product tab (scanner-friendly; Enter submits).
* On submit: call existing `searchProducts(query)` (same API as register).
* **Found:** if results non-empty, open editor for the best hit (prefer exact primarySku/sku/skus match when present; otherwise first result — document choice in implementation comments). Load via `productId` into `ProductEditorForm`.
* **Not found:** enter create mode (`productId = null`) with prefill from heuristic below.

### Barcode heuristic (locked)

* `looksLikeBarcode(query)`: after trim, **true** when length ≥ 4 and every character is a digit (`0-9`); otherwise **false**.
* If create + `looksLikeBarcode` → prefill **barcodes** (`skusText`) with the query; leave name empty (unless form requires a name before save — cashier still types name).
* If create + not barcode-like → prefill **name** with the query; leave barcodes empty.

### Editor

* Reuse `ProductEditorForm`; extend with optional `initialName` / `initialSkusText` (or equivalent) for create prefills.
* Inventory gating and `ParentPackageModal` behavior unchanged.
* Provide a clear path to reset / new lookup after save or cancel (return to lookup-ready state).

### List UI from 055

* Prefer lookup-first as the primary Product-tab flow. Demote or remove the old filterable product list if it competes; optional secondary “browse” is not required in **056**.

## Acceptance Criteria

1. [x] Product tab has a scan/type lookup that submits on Enter.
2. [x] When search returns a match, `ProductEditorForm` loads that product for edit.
3. [x] When search returns no match and query looks like a barcode, create form opens with barcodes prefilled.
4. [x] When search returns no match and query does not look like a barcode, create form opens with name prefilled.
5. [x] Parent package incomplete popup still works from the editor.
6. [x] No backend changes; uses existing product search/create/update clients.
7. [x] Vitest for `looksLikeBarcode` and load-vs-create prefill behavior (component or helper tests).
8. [x] EN/ES for lookup chrome / not-found create messaging as needed.
9. [x] Pending frontend + `docs/README.md` updated for Feature **056**.
