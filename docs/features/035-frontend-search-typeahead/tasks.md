# Task Checklist — Feature 035 Frontend Search Typeahead

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None (optional later: lower `SEARCH_LIMIT` to 10 — not in this feature).

## Frontend Tasks

- [x] 1. Extend `SearchBar` with ≥3-char live suggestions, stale-request guard, max 10 rows.
- [x] 2. Wire click / highlight+Enter add; preserve barcode Enter instant-add via existing submit path.
- [x] 3. Optional: pass `AbortSignal` from `searchProducts`.
- [x] 4. Document README; promote pending item with Feature 035; update `docs/README.md`.

## Test Tasks

- [x] 5. Vitest: threshold, cap, stale ignore, click-add, Enter highlight vs barcode submit.
