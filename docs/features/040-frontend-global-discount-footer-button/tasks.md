# Task Checklist — Feature 040 Frontend Global Discount Footer Button

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Remove always-visible global % block from `CheckoutFooter.tsx`.
- [x] 2. Add Discount button between Clear and Pay; open entry UI wired to `setGlobalDiscountPercentage`.
- [x] 3. Restore search focus on close; optional active-% affordance on the button.
- [x] 4. On ship: pending item + README/catalog Done.

## Test Tasks

- [x] 5. Vitest: Discount opens entry; commit updates totals; permanent global input gone; Pay/Clear unchanged.
