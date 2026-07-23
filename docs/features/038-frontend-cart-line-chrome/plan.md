# Implementation Plan - Frontend Cart Line Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. No API or schema changes. `sku` / `unitPrice` remain on `CartItem` for pricing and checkout payloads. Inventory fields are Feature **042** / display Feature **043**.

## Frontend Architecture

### `RegisterScreen.tsx`

* When the cart has items (or always when the list region is shown), render a sticky/static header row above the `<ul>` with labels **Product · Qty · Discount · Subtotal**.
* Use a shared grid/flex column template (CSS grid preferred) so header cells and `CartItemRow` cells share the same column tracks.
* Do **not** add a Stock track in 038; leave a comment or named grid areas that Feature 043 can extend (`qty` → `stock` → `discount` → `subtotal`) without inventing a blank column.

### `CartItemRow.tsx`

* Stop rendering the secondary `<p>` that concatenates `item.sku` and `formatMoney(item.unitPrice)`.
* Relayout as columns matching the header:
  * Product: name + `No Global %` badge
  * Qty: existing − / qty / + controls
  * Discount: Item % label/input (moved from under the name)
  * Subtotal: strikethrough + `formatMoney(priced.lineTotal)`
  * Remove button stays on the row (trailing action)
* Keep store hooks (`updateQuantity`, `setItemDiscountPercentage`, `removeItem`) and `selectItemPricedLine` as today.

### Tests — `CartItemRow.test.tsx` (+ register smoke if useful)

* Assert SKU `1001` and unit price `1.99` do not appear.
* Assert Item % control still commits / badge still shows when excluded.
* Assert accessible names / column structure as needed for Discount placement.
* Optional: assert header text in `RegisterScreen` test if one exists or add a thin test.

### Docs

* Pending frontend item already points at 038; refresh wording for headers + Discount column + “Stock deferred to 043”.
* `docs/README.md` topic line for cart line chrome updated.

## Additional Considerations

* **Implement order vs Stock:** Ship 038 independently. Features **042** then **043** add Stock between Qty and Discount when `enableInventory` is true.
* Sale ticket / Pay modal line details unchanged — out of scope.
* FE/BE separation: no Java changes in this feature.
* Coordinate CSS grid with 043 so Stock insertion does not require a full re-layout.
