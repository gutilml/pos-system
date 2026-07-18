# Feature 017 — Backend Current Open Shift Lookup

## Status

**Done** — Phase A wire-up blocker.

## Contract

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/shifts/current?storeId={uuid}` | **200** + `ShiftDTO` when an `OPEN` shift exists for the store |
| | | **404** when no open shift |
| | | **400** when `storeId` is missing (required query param) |

Response shape matches Feature 007 open/close `ShiftDTO` (id, storeId, status, cash fields, openedAt, closedAt).

## Architecture

| Layer | Change |
|-------|--------|
| `ShiftController` | `GET /current` → `getCurrentOpenShift(storeId)` |
| `ShiftService` / `ShiftServiceImpl` | Lookup via `ShiftRepository.findFirstByStoreIdAndStatus(storeId, OPEN)`; miss → `ResourceNotFoundException` |
| Schema | None |

## Tests

- `ShiftControllerTest` — 200 / 404 / missing `storeId` → 400
- `ShiftServiceImplTest` — repository hit → DTO; empty → `ResourceNotFoundException`

## Paired frontend

Feature **018** hydrates ShiftGate using this endpoint (no fail-open).
