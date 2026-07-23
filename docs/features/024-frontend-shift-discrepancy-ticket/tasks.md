# Task Checklist: Feature 024 - Frontend Shift Discrepancy Ticket

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Update `useShiftStore.closeShift` to retain/return the closed `Shift` from `closeShiftRequest` (e.g. `lastClosedShift`) while still nulling `currentShift` and calling `resetAllTickets()`.
- [x] 2. Add `ShiftCloseTicket` (or equivalent) under `frontend/src/components/shift/` showing expected / actual / discrepancy (+ timestamps) from the closed shift.
- [x] 3. Wire post-close flow from `CloseShiftModal` / `CashierMenu`: on success → show ticket; Print → `window.print()` with print styles; Done → clear ticket state.
- [x] 4. Keep blind count blind (no expected cash in `CloseShiftModal` before submit).
- [x] 5. Document in `docs/features/024-frontend-shift-discrepancy-ticket/README.md`.
- [x] 6. Mark “Post-close discrepancy ticket” done in `docs/pending feature/frontend.md` (Feature 024); update `docs/README.md` catalog + topic row.

## Test Tasks

- [x] 7. Extend `useShiftStore.test.ts` for closed-shift payload retention/return.
- [x] 8. Component tests for ticket display, dismiss, and print invocation; assert blind-count UI still hides expected totals.
