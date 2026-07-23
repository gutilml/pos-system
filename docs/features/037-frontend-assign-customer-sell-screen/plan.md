# Implementation Plan - Frontend Assign Customer From Selling Screen

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse Feature 019/020:

```http
GET /api/v1/customers/search?storeId=&q=
```

via existing `CustomerSearch` / customer API helpers.

## Frontend Architecture

### UI entry

* Add a lightweight control on the register shell — prefer `CheckoutFooter` (near existing customer chip) or header actions next to `CashierMenu`.
* Opening shows a small modal/sheet with `CustomerSearch` (`autoFocus`), Confirm-by-select (search already selects), and Cancel.
* Reuse `AssignedCustomer` mapping already used in checkout.

### State

* Call `useCartStore.getState().setCustomer` / existing `setCustomer` action — no new persist shape.
* Footer customer banner already present when `customer` is set; ensure Clear is reachable from selling screen (footer Clear or assign modal Clear).

### Pay interaction

* No change required to transaction payload if 036/014 already send `customerId`.
* CREDIT interception in Pay should no-op when customer already assigned.

### Tests

* Component test: open assign UI → mock search select → assert store customer; clear → null.

## Additional Considerations

* Implement after 036 so Pay redesign and sell-screen assign do not fight for footer layout in the same commit stream (separate features/commits per `.cursorrules`).
* Focus lock (034): treat assign modal like other modals (suppress search lock; restore on close).
* FE/BE separation: no Java changes.
