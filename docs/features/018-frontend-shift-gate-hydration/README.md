# Feature 018 — Frontend ShiftGate Hydration (No Fail-Open)

## Status

**Done** — Phase A. Depends on Feature 017.

## Behavior

| Hydration result | UI |
|------------------|----|
| Loading | Spinner (“Checking shift status…”) |
| 404 / null | `OpenShiftModal` |
| API / network error | Error + Retry (`hydrationFailed`) — **not** Open Shift |
| Open shift | Register children |

## Key changes

- `fetchCurrentShift(storeId)` → `GET /api/v1/shifts/current?storeId=`
- `useShiftStore.hydrationFailed` distinguishes API failure from “no open shift”
- `ShiftGate` Retry calls `checkCurrentShift` again
