# Implementation Plan - Frontend UI Locale Coverage Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None.

## Frontend Architecture

1. **Messages** — Add/adjust keys in `frontend/src/i18n/messages.ts`, e.g.:
   * `customer.find` / `customer.searchPlaceholder` / clear/assign strings as needed after reading `AssignCustomerControl` + `CustomerSearch`.
   * `tickets.new` → EN `+ New Ticket`, ES `+ Ticket nuevo` (or without `+` if the `+` is rendered separately).
   * `cart.stock` → change both locales from `Stock` to `Inv`.
2. **Wire components** — Replace hardcoded strings in:
   * `AssignCustomerControl.tsx`
   * `CustomerSearch.tsx`
   * `TicketTabs.tsx`
   * Confirm cart header already uses `t('cart.stock')` (Feature 043/046); updating the dictionary may be enough.
3. **Tests** — Update `AssignCustomerControl.test.tsx`, `CheckoutModal.test.tsx` (Find customer label), any TicketTabs / cart header tests; add ES locale render check where auth/locale store can be stubbed (mirror 046 tests).

## Additional Considerations

* FE-only commit; keep backend untouched.
* CREDIT gate English in `CheckoutModal` (“Assign a customer…”) is adjacent—include only if still hardcoded and trivial in the same pass; otherwise leave as a follow-up note in pending (do not expand scope without need).
