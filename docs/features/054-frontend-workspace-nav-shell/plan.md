# Implementation Plan - Frontend Workspace Nav Shell

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. No API or schema changes.

## Frontend Architecture

### Shell refactor (`RegisterScreen.tsx`)

* Keep `AuthGate` → `ShiftGate` as the outer wrappers.
* Introduce lightweight local state (or a tiny store) for `activeWorkspace: 'sell' | 'products' | 'customer' | 'inventory'`.
* Structure:

  1. Header (unchanged chrome)
  2. `WorkspaceNav` row
  3. Body switch:
     * `sell` → current TicketTabs + SearchBar + cart + CheckoutFooter + WeightModal
     * `products` → stub panel (Feature **055** replaces)
     * `customer` / `inventory` → shared ComingSoon placeholder

* Prefer extracting sell body into something like `SellWorkspace` so Products workspaces in **055** do not fight header markup.

### `WorkspaceNav`

* New component (e.g. `frontend/src/components/workspace/WorkspaceNav.tsx`).
* Read `enableInventory` from `useAuthStore((s) => s.user?.enableInventory === true)`.
* Buttons call `onSelect(workspace)`; Inventory omitted when flag false.
* Use `role="tablist"` / `role="tab"` or clear `aria-current` for a11y.

### Placeholders

* Simple full-width panel: title + “Coming soon” (i18n). No cards-heavy chrome; match register density (slate borders like TicketTabs).

### i18n

* Add keys under e.g. `workspace.sell`, `workspace.products`, `workspace.customer`, `workspace.inventory`, `workspace.comingSoon` in `messages.ts` (EN + ES).
* Update `messages.test.ts` for at least one Spanish string.

### Tests

* Component test: Inventory button absent when `enableInventory` false; present when true.
* Switching to Customer/Inventory shows placeholder; Sell restores cart region / search.

### Docs

* Mark Feature **053** README as modal shipped / followed by **054–056** (done in this planning pass).
* Pending + catalog rows for **054**.

## Additional Considerations

* **Search focus lock (034):** When leaving Sell, do not steal focus into sell SearchBar; when returning to Sell, existing `requestRegisterSearchFocus` patterns may apply.
* **Assign customer** stays in the header for v1 (sell-oriented); Customer workspace remains placeholder only.
* FE/BE separation: no Java changes.
* Implement **054** before **055** / **056**.
