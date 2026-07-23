# Implementation Plan - Frontend Cart Header Column Alignment

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None.

## Frontend Architecture

* Replace `auto` qty/actions tracks with fixed rem widths shared by `CART_ROW_GRID` and `CART_ROW_GRID_WITH_STOCK`.
* `CartListHeader` and `CartItemRow` both consume those constants so track sizes match.
* Keep Feature 043 conditional Stock track between Qty and Discount.

## Additional Considerations

* Seed / product catalog changes are unrelated and must not ship in this feature’s commit.
