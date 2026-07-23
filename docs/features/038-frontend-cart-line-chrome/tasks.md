# Task Checklist — Feature 038 Frontend Cart Line Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add Product / Qty / Discount / Subtotal header row in `RegisterScreen.tsx` (shared column template with rows; no Stock).
- [x] 2. Relayout `CartItemRow.tsx`: hide SKU/unit price; Product (name + badge) · Qty · Discount (Item %) · Subtotal; keep Remove.
- [x] 3. Update `CartItemRow.test.tsx` (and header coverage as needed) for hidden chrome + Discount column placement; keep discount/badge coverage.
- [x] 4. Document README status when shipping; refresh pending frontend wording; update `docs/README.md` status to Done.

## Test Tasks

- [x] 5. Vitest: row with SKU/unit price does not render those strings; headers Product/Qty/Discount/Subtotal present; name + line total + Item % still work.
