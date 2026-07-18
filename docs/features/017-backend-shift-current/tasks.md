# Tasks: Feature 017 - Backend Current Open Shift Lookup

## Backend Tasks

- [x] 1. Add `getCurrentOpenShift(UUID storeId)` to `ShiftService` and implement in `ShiftServiceImpl` using `findFirstByStoreIdAndStatus(..., OPEN)`.
- [x] 2. Expose `GET /api/v1/shifts/current` on `ShiftController` with required `storeId` query param; 404 when none open.
- [x] 3. Add/extend `ShiftControllerTest` and service unit tests for 200, 404, and missing `storeId`.
- [x] 4. After tests pass, add/update `docs/features/017-backend-shift-current/README.md` with the endpoint contract.
- [x] 5. Mark the `GET /api/v1/shifts/current` item done in `docs/pending feature/backend.md` (note Feature 017).

## Frontend Tasks

- None (strict backend isolation).

## Test Tasks

- [x] 6. Verify `@WebMvcTest(ShiftController.class)` covers GET current; service test covers repository miss → not found.
