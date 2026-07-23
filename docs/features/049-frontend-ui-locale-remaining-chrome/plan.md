# Implementation Plan - Frontend UI Locale Remaining Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Frontend Architecture

1. Extend `messages.ts` with checkout credit/tender, shift close/open hints, drawer, weight extensions, sale/shift tickets, common print/done/retry, auth/shift gates.
2. Wire `useT()` in: `CheckoutModal`, `TenderAmountFields`, `CloseShiftModal`, `DrawerEventModal`, `OpenShiftModal`, `WeightModal`, `SaleTicket`, `ShiftCloseTicket`, `ShiftGate`, `AuthGate`; optional `CashierMenu` language-save error.
3. Prefer reuse: `footer.clear` / `footer.cancel` / `customer.availableCredit` / `cashier.payIn|payOut|closeShift` / `weight.title|cancel`.
4. Leave `StripePaymentModal` untranslated (on hold).

## Tests

Update queries that asserted English copy; add one ES render test for Close Shift or credit gate.
