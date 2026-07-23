# Feature: Frontend Cart Stock Column

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Add an optional **Stock** column to the register cart so cashiers see how much inventory remains after the quantities already on the active ticket. Stock comes from Feature 042 product/auth fields; layout slots into Feature 038’s table-like cart between Qty and Discount. When the store has inventory disabled, the column and its header are omitted entirely.

## User Stories

* As a cashier in an inventory-enabled store, I want to see remaining stock next to qty so I notice oversells before Pay.
* As a cashier, I want Stock to update immediately when I change qty on the ticket so the number matches what I’m about to sell.
* As a cashier in a store with inventory off, I want no Stock column so the cart stays as Product / Qty / Discount / Subtotal only.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature **042** (`currentStock`, `trackInventory` on products; `enableInventory` on `/me`); Feature **038** column layout (ship 038 first or in the same FE batch after 042 — Stock must not regress 038 headers).
* **Out of scope:** Backend changes; blocking checkout on negative stock; inventory admin screens; refreshing stock from the server mid-ticket (snapshot at add is enough unless product is re-fetched); changing Feature 005 deduction.

## UX & Business Rules

### Visibility

* Read `enableInventory` from auth user (`AuthUser` / `useAuthStore` after login/`fetchMe`).
* If `enableInventory !== true`: **do not render** Stock header or Stock cells (cart columns remain Product · Qty · Discount · Subtotal from 038).
* If `enableInventory === true`: render Stock between Qty and Discount → **Product · Qty · Stock · Discount · Subtotal**.

### Display value

* Cart remains **one line per `productId`**; use that line’s `quantity`.
* Persist on the cart line a snapshot of `currentStock` (and `trackInventory`) from the product at **add** time (`toCartProduct` → `addItem`). When merging into an existing line, keep the existing line’s `currentStock` / `trackInventory` (do not overwrite snapshot on re-scan unless explicitly refreshing — default: keep first snapshot).
* `displayStock = currentStock − quantity` (use existing qty/`roundMoney` scale-4 conventions for arithmetic; display with a sensible tabular number — integer-ish when whole, otherwise match qty display style used on the Qty column).
* If `trackInventory` is false: show **"—"** (column still visible when store inventory is on).
* Negative `displayStock` may display as a negative number (no checkout block in this feature).

### Wiring

* Extend `ProductApi`, `CartProduct`, and `CartItem` with optional `currentStock` / `trackInventory`.
* Map in `toCartProduct`; copy onto `CartItem` in `useCartStore` add/merge path; include in `normalizeCartItem` defaults (`trackInventory: false`, `currentStock: 0` or undefined → treat as non-tracked / zero carefully — prefer defaults that show "—" when track flag false).

## Acceptance Criteria

1. [x] When `enableInventory` is false, Stock header and cells are absent; 038 headers Product/Qty/Discount/Subtotal remain.
2. [x] When `enableInventory` is true, Stock header appears between Qty and Discount.
3. [x] For tracked products, Stock cell shows `currentStock − quantity` and updates immediately when qty changes.
4. [x] For `trackInventory === false` with inventory on, Stock cell shows "—".
5. [x] Product search → cart add carries `currentStock` / `trackInventory` from Feature 042 DTO fields.
6. [x] Vitest covers hide/show column, display formula, and "—" for non-tracked; existing cart discount tests still pass.
7. [x] Pending frontend inventory/stock item notes Feature 043 path (keep `[ ]` until shipped); `docs/README.md` updated.
