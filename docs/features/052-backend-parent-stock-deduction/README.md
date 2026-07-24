# Feature 052 — Backend Parent Package Stock Deduction on Sale

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — parent package deduction with unit conversion; insufficient-stock reject when parent tracks inventory.

## Summary

When a sold line’s product has `parentProductId` and inventory is enabled, deduct parent stock in **packages**:

`parent_stock_delta = − (sold_qty ÷ parent.qty_per_package)`

Child has no `qtyPerPackage`. Sold qty is in the parent’s package unit (with conversion if child sell UoM differs, matching Feature 050 cost rules).

## Examples

* Water: parent qty 50 bottles/bag; sell 1 bottle → parent `−1/50` bag.
* Rice: parent 1 kg/bag; sell 0.5 kg → parent `−0.5` bag.

## Out of scope

* Admin UI; changing Feature 050 field definitions; org inventory.
