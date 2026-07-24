# Feature: Frontend Workspace Nav Shell

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Introduce a first-class POS **workspace** chrome: a button row under the existing Register header that switches between Register/Sell and future areas (Products, Customer, Inventory). This replaces the long-term need to bury catalog work inside a CashierMenu modal. Feature 054 ships only the shell, Register/Sell content, and placeholders — Products content lands in 055/056.

## User Stories

* As a cashier, I want clear workspace buttons under the header so I can leave sell mode without hunting in the Cashier menu.
* As a cashier in an inventory-enabled store, I want an Inventory workspace button visible so I know that area will live beside Sell/Products.
* As a cashier in a store with inventory off, I do not want an Inventory button cluttering the nav.
* As a cashier, I still want login and open-shift gates before any workspace so security and shift rules are unchanged.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** AuthGate (**026**), ShiftGate (**008/018**), `enableInventory` on auth user (**042**).
* **Out of scope:** Backend/API changes; Products Product|Category UI (**055**); product lookup load-or-create (**056**); real Customer or Inventory screens; removing CashierMenu Catalog (**055**); role-gated nav; changing AssignCustomer / TicketTabs / SearchBar / cart behavior while on Register/Sell.

## UX & Business Rules

### Layout

* Preserve the current dark header row (title, assign customer, Cashier menu).
* Add a second row **immediately below** the header (above TicketTabs when on Sell) with workspace buttons.
* Active workspace is visually distinct (selected state). Default workspace on load: **Register/Sell**.

### Buttons (v1)

| Button | Visibility | Content in 054 |
|--------|------------|----------------|
| Register / Sell | Always | Existing sell UI: TicketTabs, SearchBar, cart, CheckoutFooter, WeightModal |
| Products | Always | Stub/placeholder OK until **055** (or empty panel with label) |
| Customer | Always | “Coming soon” placeholder only |
| Inventory | Only if `enableInventory === true` | “Coming soon” placeholder only |

### Gates

* Entire shell remains inside `AuthGate` → `ShiftGate` (same as today’s `RegisterScreen`).

### Catalog modal

* Leave Feature **053** Catalog entry in `CashierMenu` until Feature **055** migrates Products and removes it.

## Acceptance Criteria

1. [x] A workspace nav row renders below the POS Register header and above Sell content (when Sell is active).
2. [x] Buttons include Register/Sell, Products, and Customer; Inventory appears if and only if `user.enableInventory === true`.
3. [x] Selecting Register/Sell shows the existing sell UI (tickets, search, cart, footer) functionally unchanged.
4. [x] Selecting Customer shows a coming-soon placeholder (no real customer admin).
5. [x] Selecting Inventory (when visible) shows a coming-soon placeholder (no real inventory screens).
6. [x] AuthGate and ShiftGate still wrap the shell; unauthenticated / no-shift behavior unchanged.
7. [x] CashierMenu Catalog modal still works (removal deferred to **055**).
8. [x] EN/ES i18n for workspace button labels and placeholder copy.
9. [x] Vitest covers nav visibility (Inventory gated) and workspace switching to placeholders vs Sell.
10. [x] Pending frontend + `docs/README.md` catalog/topic updated for Feature **054**.
