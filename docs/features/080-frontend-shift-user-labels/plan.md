# Plan — 080 Frontend shift user labels

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. BE: add `openedByUsername` / `closedByUsername` on `ShiftDTO` / `ShiftDetailDTO`; resolve via `UserRepository` in `ShiftServiceImpl`.
2. FE: extend `Shift` type; render on close-ticket and history detail.
3. Locale strings; null → “—” fallbacks.
4. Component + service tests; mark Done.
