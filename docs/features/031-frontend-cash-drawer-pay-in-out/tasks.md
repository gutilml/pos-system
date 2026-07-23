# Task Checklist — Feature 031 Frontend Cash Drawer Pay-In / Pay-Out

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None (Feature 007 already ships `POST /api/v1/shifts/{id}/events`).

## Frontend Tasks

- [x] 1. Extend `frontend/src/api/shifts.ts` with drawer event types + `addDrawerEventRequest`.
- [x] 2. Add `DrawerEventModal` (type, amount, reason; success/error handling).
- [x] 3. Wire entry from `CashierMenu` when an open shift exists.
- [x] 4. Document in feature README; update `docs/README.md` + pending frontend.

## Test Tasks

- [x] 5. Vitest: validation, successful POST body, error path, menu gated on open shift.
