# Implementation Plan - Frontend Products Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse Feature **050** product and **051** category APIs already wired in `api/products.ts` / `api/categories.ts`.

## Frontend Architecture

### Products workspace container

* New component e.g. `ProductsWorkspace.tsx` mounted when `activeWorkspace === 'products'` (Feature **054** stub replacement).
* Internal state: `productsSubTab: 'product' | 'category'`.
* Sub-tab strip: Product | Category (style aligned with TicketTabs density — under workspace nav, not a modal header).

### Reuse Feature 053 pieces

* `CategoryPanel` → Category tab unchanged API (`onChanged` optional for any product list refresh).
* `ProductEditorForm` + `ParentPackageModal` → Product tab.
* Unwrap `CatalogAdminModal` body: extract list/editor layout into e.g. `ProductAdminPanel.tsx` used by Products workspace (Feature **056** will evolve Product tab further).

### CashierMenu cleanup

* Delete Catalog button, `catalogOpen` state, and `CatalogAdminModal` import from `CashierMenu.tsx`.
* Fix `CashierMenu.locale.test.tsx` / any catalog menu assertions.
* Remove obsolete `cashier.catalog` usage (key may remain briefly unused or be deleted with messages test updates).

### i18n

* Prefer reusing `admin.productsTab` / `admin.categoriesTab` for sub-tabs if labels fit; else add `workspace.productTab` / `workspace.categoryTab`.

### Tests

* ProductsWorkspace: switch Product ↔ Category; CategoryPanel visible on Category.
* CashierMenu: no `catalog-menu-item`.
* Keep existing ProductEditorForm / CategoryPanel tests green.

### Docs

* Pending + catalog for **055**; Feature **053** already notes modal superseded.

## Additional Considerations

* **Search focus (034):** Products workspace should not fight sell SearchBar focus lock; modal-open helpers tied to Catalog may need cleanup when modal dies.
* Do not implement barcode/name load-or-create here — that is **056**.
* Strict FE-only; implement after **054**.
