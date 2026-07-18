# Specification: Feature 017 - Backend Current Open Shift Lookup

## Objective
Expose a store-scoped read API that returns the currently open shift (or 404 when none exists), so the register can hydrate shift state from the backend as the source of truth.

## Scope
* **Strictly Backend:** No frontend code.
* **Module:** `com.pos.core` shift lifecycle (extends Feature 007).
* **Out of scope:** Auth / cashier identity on shifts, shift history list, pay-in/pay-out policy changes.

## Business Rules & Technical Constraints
* A store may have at most one `OPEN` shift (already enforced by Feature 007).
* `GET /api/v1/shifts/current` must be store-scoped via required `storeId` query parameter until auth provides store context.
* When an `OPEN` shift exists for that store, return the existing `ShiftDTO` with HTTP 200.
* When no open shift exists, return HTTP 404 (so the SPA can treat “none” distinctly from other errors).
* Do not invent a closed-shift fallback; only `OPEN` shifts qualify as “current”.

## Acceptance Criteria
1. [x] `GET /api/v1/shifts/current?storeId={uuid}` returns 200 and a `ShiftDTO` with `status=OPEN` when that store has an open shift.
2. [x] The same endpoint returns 404 when the store has no open shift.
3. [x] Missing or invalid `storeId` is rejected with a clear 4xx (validation / bad request).
4. [x] Existing open / events / close endpoints remain unchanged.
5. [x] JUnit/WebMvc tests cover happy path, 404, and missing `storeId`.
