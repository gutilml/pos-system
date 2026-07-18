# Plan: Feature 018 - Frontend ShiftGate Hydration (No Fail-Open)

## Backend Architecture

None (frontend-only). Relies on Feature 017 `GET /api/v1/shifts/current?storeId=`.

## Frontend Architecture

### API client — `frontend/src/api/shifts.ts`
* Change `fetchCurrentShift()` to accept `storeId` (default `DEFAULT_STORE_ID`) and call `/api/v1/shifts/current?storeId=…`.
* Keep 404 → `null` mapping; other non-OK statuses continue to throw.

### Store — `frontend/src/store/useShiftStore.ts`
* In `checkCurrentShift`, **stop** treating catch-all failures as `currentShift: null` without a distinct UX path.
* On failure: set `error`, keep `currentShift` null, `isLoading: false`.
* Optionally add `hydrationFailed: boolean` or rely on `error != null && currentShift == null && !isLoading` for gate branching.
* Add `retryCheckCurrentShift` alias or reuse `checkCurrentShift` from Retry button.

### UI — `frontend/src/components/shift/ShiftGate.tsx`
* Branch order: loading → **hydration error + Retry** → no shift (`OpenShiftModal`) → children.
* Do not render `OpenShiftModal` when `error` indicates API failure.

### Tests
* Update `useShiftStore.test.ts` and `ShiftGate.test.tsx` for the three outcomes.

## Additional Considerations

* Open Shift / Close Shift error toasts can stay as today; this feature focuses on initial hydration honesty.
* Update `docs/pending feature/frontend.md` item for `shifts/current` dependency when shipped.
