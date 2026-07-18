# Feature 018 — Frontend ShiftGate Hydration (No Fail-Open)

## Status

**Planned** (Phase A). Depends on Feature 017.

## Intended behavior

| Hydration result | UI |
|------------------|----|
| Loading | Spinner (“Checking shift status…”) |
| 404 / null | `OpenShiftModal` |
| API / network error | Error + Retry (not Open Shift) |
| Open shift | Register children |

Touches: `api/shifts.ts`, `useShiftStore.ts`, `ShiftGate.tsx`.
