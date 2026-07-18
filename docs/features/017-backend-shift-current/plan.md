# Plan: Feature 017 - Backend Current Open Shift Lookup

## Backend Architecture

### Controller
Extend `ShiftController` (`backend/src/main/java/com/pos/core/controllers/ShiftController.java`):

* `GET /api/v1/shifts/current?storeId={uuid}` → `ShiftDTO`
* Require `storeId` as `@RequestParam UUID storeId`
* Map “no open shift” to `ResourceNotFoundException` (existing `@ResponseStatus(NOT_FOUND)` / `GlobalExceptionHandler`)

### Service
Extend `ShiftService` / `ShiftServiceImpl`:

* Add `ShiftDTO getCurrentOpenShift(UUID storeId)`
* Use existing `ShiftRepository.findFirstByStoreIdAndStatus(storeId, ShiftStatus.OPEN)`
* Reuse private `toDto(Shift)` mapper already in `ShiftServiceImpl`

### Data model
No schema or entity changes. Repository query already exists.

### Security / tenancy
Until AuthN lands, callers pass `storeId` explicitly (same pattern as `POST /shifts/open`). Do not fail open on the server.

## Frontend Architecture

None (backend-only feature).

## Additional Considerations

* Keep response shape identical to open/close `ShiftDTO` so Feature 008/018 clients need no DTO changes.
* Document the contract in this feature’s README after implementation.
* Promote/check off the matching item in `docs/pending feature/backend.md` when shipped.
