# Feature 107 — Frontend Cashier Menu + Modal UX

## Status

**Done** — Cashier menu actions were consolidated, Settings moved into Cashier menu, key modals now close on Escape, and drawer reason validation now explains minimum length errors before submit.

## Summary

This feature improves cashier flow and consistency:

- Replaces split `Pay in` / `Pay out` menu items with a single `Money movement` entry.
- Moves `Settings` access from top workspace nav into `Cashier` menu.
- Makes Escape key close open overlays for checkout, drawer, shift close/history, closed tickets, and weight modal.
- Adds local drawer reason validation for minimum 10 characters, aligned with backend policy.

## Key files

- `frontend/src/components/shift/CashierMenu.tsx`
- `frontend/src/components/register/WorkspaceNav.tsx`
- `frontend/src/features/register/RegisterScreen.tsx`
- `frontend/src/components/shift/DrawerEventModal.tsx`
- `frontend/src/components/shift/CloseShiftModal.tsx`
- `frontend/src/components/shift/ShiftHistoryModal.tsx`
- `frontend/src/components/register/ClosedTicketsModal.tsx`
- `frontend/src/components/checkout/CheckoutModal.tsx`
- `frontend/src/i18n/messages.ts`

## Tests

- `frontend/src/components/shift/CashierMenu.test.tsx`
- `frontend/src/components/register/WorkspaceNav.test.tsx`
- `frontend/src/components/shift/DrawerEventModal.test.tsx`
- `frontend/src/components/shift/CloseShiftModal.test.tsx`
- `frontend/src/components/shift/ShiftHistoryModal.test.tsx`
- `frontend/src/components/register/ClosedTicketsModal.test.tsx`
- `frontend/src/components/checkout/CheckoutModal.test.tsx`
- `frontend/src/components/register/WeightModal.test.tsx`
