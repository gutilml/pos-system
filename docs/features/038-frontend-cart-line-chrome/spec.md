# Feature: Frontend Cart Line Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Simplify and regrid each sell-list cart row so cashiers scan tickets faster: hide SKU and unit-price chrome, present a table-like list with headers **Product · Qty · Discount · Subtotal**, and place the item discount control in its own Discount column. Stock availability is intentionally deferred to Feature 043 (after backend 042); this feature does not reserve an empty Stock column.

## User Stories

* As a cashier, I want cleaner cart rows with clear column headers so I can scan the ticket faster during a busy sale.
* As a cashier, I want item % discount in a dedicated Discount column so I am not fighting a cramped control under the product name.
* As a cashier, I still want the “No Global %” badge next to the product name when exclusions apply so discount behavior remains visible.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 016 cart row discount UI; Feature 028 primary/empty SKU display (row may still store `sku` / `unitPrice` in state for pricing and API).
* **Out of scope:** Backend changes; pricing math; footer totals / global discount placement (039 / 040); Pay modal layout (041); **Stock column / inventory display** (Features **042** / **043**); inventing a placeholder Stock column.

## UX & Business Rules

### Hide chrome

* In `CartItemRow`, do not render SKU or unit price (remove the secondary `{sku} · {unitPrice}` line).
* Cart item model still holds `sku` and `unitPrice` for store math, receipts, and search — only the sell-list chrome is reduced.
* Do not show unit price elsewhere on the row as a substitute.

### Column headers (038 only — no Stock)

* Above the cart `<ul>` (or equivalent), render a header row aligned with data columns:
  * **Product** — name + optional `No Global %` badge
  * **Qty** — − / quantity / +
  * **Discount** — Item % input (moved/replaced from the cramped under-name control)
  * **Subtotal** — line total after discounts (strikethrough original when discounted)
* Remove remains a row action (not a labeled data column); keep accessible remove control without adding a “Remove” header unless layout needs it for alignment.
* When Feature **043** ships, it will insert a **Stock** header/column between **Qty** and **Discount** when store inventory is enabled — design 038’s grid so that insertion is a local follow-up, not a rewrite.

### Discount column

* Cashier types item discount in the Discount column (same fraction rules as Feature 016: display %, commit on blur/Enter via `setItemDiscountPercentage`).
* Keep `No Global %` badge with the product name in the Product column (not inside Discount).

### Cart line identity

* Active ticket remains **one line per `productId`** (`useCartStore` merges qty). Column layout assumes that model.

## Acceptance Criteria

1. [ ] Cart sell-list rows do not display SKU text.
2. [ ] Cart sell-list rows do not display unit price.
3. [ ] Cart list shows column headers **Product**, **Qty**, **Discount**, and **Subtotal** (no Stock header in 038).
4. [ ] Rows align under those headers: name (+ badge), qty controls, Item % input in Discount, line total (and strikethrough original when discounted) in Subtotal.
5. [ ] Item % discount behavior and `No Global %` badge behavior remain functionally unchanged (only placement/chrome changes).
6. [ ] Vitest for `CartItemRow` / register cart asserts SKU/unit price are not shown; headers present; existing discount tests still pass.
7. [ ] Pending “Cart line chrome” notes Feature 038 triad path (keep `[ ]` until shipped); `docs/README.md` catalog/topic updated for expanded 038 scope.
