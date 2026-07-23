# Feature 031 — Frontend Cash Drawer Pay-In / Pay-Out

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Cashier menu shows **Pay in** / **Pay out** only when a shift is open.
* `DrawerEventModal` collects type, amount (> 0), and required reason; posts to `POST /api/v1/shifts/{id}/events`.
* Does not show expected cash or invent drawer math.
* Blind count / close ticket unchanged.

## Key files

* `frontend/src/api/shifts.ts` — `addDrawerEventRequest`
* `frontend/src/store/useShiftStore.ts` — `addDrawerEvent`
* `frontend/src/components/shift/DrawerEventModal.tsx`
* `frontend/src/components/shift/CashierMenu.tsx`

## Depends on

Feature 007 events API.

## Out of scope

Backend policy (caps, manager auth); event history list; role-gated drawer actions.
