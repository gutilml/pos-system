# Specification: Feature 018 - Frontend ShiftGate Hydration (No Fail-Open)

## Objective
Make register shift hydration honest: when `GET /api/v1/shifts/current` succeeds with no open shift, show Open Shift; when the API errors or is unreachable, show a recoverable error state instead of silently treating the failure as “no shift.”

## Scope
* **Strictly Frontend:** Only `frontend/` changes.
* **Depends on:** Feature 017 backend endpoint (or equivalent live `shifts/current`).
* **Out of scope:** Auth-derived store context (keep `DEFAULT_STORE_ID` for now), pay-in/pay-out UI, discrepancy ticket.

## UX & Business Rules
* On mount, `ShiftGate` / `useShiftStore.checkCurrentShift` must call `GET /api/v1/shifts/current?storeId=…`.
* **404 / null open shift:** render `OpenShiftModal` (existing gate).
* **Network / 5xx / unexpected errors:** do **not** open the register and do **not** show Open Shift as if the cashier simply has no shift. Show an error message with Retry.
* Loading spinner remains while the first hydration request is in flight.
* Zero-trust: never assume a shift is open from localStorage alone.

## Acceptance Criteria
1. [x] `fetchCurrentShift` sends `storeId` (using `DEFAULT_STORE_ID` until auth exists).
2. [x] Successful “no open shift” (404 → null) still shows `OpenShiftModal`.
3. [x] Failed hydration sets `error` and `ShiftGate` shows retry UI; children (register) are not rendered.
4. [x] Successful open shift still renders register children.
5. [x] Vitest coverage for store + `ShiftGate`: success, 404/null, and error/retry paths.
