# Feature 024 — Frontend Shift Discrepancy Ticket

## Status

**Done** — post-close discrepancy ticket with browser print.

## Behavior

* Blind count stays blind in `CloseShiftModal` (no expected cash before submit).
* On successful `POST /api/v1/shifts/{id}/close`, `useShiftStore` keeps `lastClosedShift` and `ShiftGate` shows **Shift Close Ticket** with expected / counted / discrepancy from the API.
* **Print** → `window.print()` (print chrome hidden via `print:hidden`); **Done** clears `lastClosedShift` and returns to Open Shift gate.
* Closing with variance does **not** require manager auth (decision 2026-07-17).

## Depends on

Feature 007 close API — `ShiftDTO` already includes `expectedCash`, `actualCash`, `discrepancy`.

## Out of scope

Auth/RBAC, pay-in/pay-out UI, sales receipt printing, backend expected-cash formula changes (CASH tenders only — see pending backend).
