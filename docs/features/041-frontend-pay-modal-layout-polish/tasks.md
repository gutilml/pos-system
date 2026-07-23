# Task Checklist — Feature 041 Frontend Pay Modal Layout Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Polish `CheckoutModal.tsx` section hierarchy (Grand total / Remaining, tender list, actions) toward the review mock without changing tender math.
- [x] 2. Polish `TenderInputArea.tsx` so CASH / CARD / CREDIT read as method choices and amount clearly applies to the selection.
- [x] 3. Verify PAY / Print and pay enablement still requires Remaining = 0; Print and pay stays secondary.
- [x] 4. On ship: pending item + README/catalog Done.

## Test Tasks

- [x] 5. Vitest: method + amount → Remaining drops; overpay rejected; PAY disabled until exact cover; CREDIT gate unchanged.
