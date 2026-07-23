# Task Checklist — Feature 043 Frontend Cart Stock Column

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None (depends on Feature 042 already shipped).

## Frontend Tasks

- [x] 1. Extend `AuthUser` + auth store for `enableInventory` (default false).
- [x] 2. Extend `ProductApi` / `CartProduct` / `CartItem` + `toCartProduct` + `useCartStore` add/merge/normalize for `currentStock` / `trackInventory`.
- [x] 3. Conditionally add Stock header in `RegisterScreen` between Qty and Discount when inventory enabled.
- [x] 4. Conditionally render Stock cell in `CartItemRow` (`currentStock − quantity`, or "—").
- [x] 5. Update Vitest (`CartItemRow`, `products`, auth/cart as needed).
- [x] 6. Pending frontend + `docs/README.md` status Done when shipped.

## Test Tasks

- [x] 7. Vitest: inventory off → no Stock; on + tracked → formula; on + untracked → "—"; qty change updates display.
