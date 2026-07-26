# Plan — 077 Backend shift history

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Repository: query shifts by `storeId` (optional status), order by opened/created desc.
2. Extend or reuse `ShiftDTO` for list rows; detail DTO includes events + totals already used on close/current.
3. `ShiftController`: `GET` list + `GET` by id (authorize caller's store).
4. JUnit for list filters, detail happy path, 404, store mismatch.
5. Mark triad Done; unlock FE **078**.
