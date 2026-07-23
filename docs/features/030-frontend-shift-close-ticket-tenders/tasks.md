# Task Checklist — Feature 030 Frontend Shift Close Ticket Tenders

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None. Requires Feature 029.

## Frontend Tasks

- [x] 1. Extend `Shift` in `frontend/src/api/shifts.ts` for 029 summary fields.
- [x] 2. Update `ShiftCloseTicket` to show CARD + CREDIT + CASH / sales grand total from API; keep Print/Done.
- [x] 3. Confirm `CloseShiftModal` remains blind (no expected/tender breakdown).
- [x] 4. Document in feature README; update `docs/README.md` + pending frontend.

## Test Tasks

- [x] 5. Vitest: ticket renders new totals; fixtures updated; blind-count modal still hides expected and tender totals.
