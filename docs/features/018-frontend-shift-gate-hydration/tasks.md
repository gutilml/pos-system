# Tasks: Feature 018 - Frontend ShiftGate Hydration (No Fail-Open)

## Backend Tasks

- None (strict frontend isolation). Requires Feature 017 live first for end-to-end demos.

## Frontend Tasks

- [ ] 1. Update `fetchCurrentShift` in `api/shifts.ts` to pass `storeId` query param.
- [ ] 2. Refactor `useShiftStore.checkCurrentShift` so API failures set `error` and do not silently fail-open to “no shift.”
- [ ] 3. Update `ShiftGate` to show error + Retry when hydration fails; keep Open Shift only for confirmed null/404.
- [ ] 4. Write/update Vitest tests in `useShiftStore.test.ts` and `ShiftGate.test.tsx`.
- [ ] 5. Add/update `docs/features/018-frontend-shift-gate-hydration/README.md` after tests pass.
- [ ] 6. Mark the `GET /api/v1/shifts/current` dependency item done (or note Feature 018) in `docs/pending feature/frontend.md`.

## Test Tasks

- [ ] 7. Cover: open shift → children; 404 → OpenShiftModal; throw → error UI with retry calling `checkCurrentShift` again.
