# Feature 106 — Frontend Over-cash Approval Password UX

## Status

**Done** — Drawer PAY_OUT and closed-ticket reimburse now prompt for approval password and retry when backend 081 returns approval-required errors.

## Summary

Backend Feature 081 enforces same-user password approval when cash-out exceeds available drawer cash. This feature adds the corresponding frontend UX:

- Drawer event modal catches approval-required error and reveals password field.
- Closed tickets reimburse catches approval-required error and reveals password field.
- Retry submits include `approvalPassword` in request payload.

## API updates

- `CashDrawerEventRequest` now supports optional `approvalPassword`.
- `ReimburseRequest` now supports optional `approvalPassword`.

## UX behavior

1. User submits PAY_OUT or reimburse.
2. If backend responds with approval-required error, modal/panel shows approval password prompt.
3. User enters password and retries.
4. FE resends same request body plus `approvalPassword`.

## Key files

- `frontend/src/api/shifts.ts`
- `frontend/src/api/transactions.ts`
- `frontend/src/components/shift/DrawerEventModal.tsx`
- `frontend/src/components/register/ClosedTicketsModal.tsx`
- `frontend/src/i18n/messages.ts`

## Tests

- `frontend/src/components/shift/DrawerEventModal.test.tsx`
- `frontend/src/components/register/ClosedTicketsModal.test.tsx`

Both suites pass with approval-retry scenarios.
