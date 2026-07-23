# Feature 035 — Frontend Search Typeahead

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Typeahead starts at **3** characters; refreshes each keystroke; shows ≤ **10** rows.
* Click or Arrow+Enter adds a suggestion; bare Enter keeps barcode/first-hit submit.
* Stale requests aborted via `AbortSignal`.

## Key files

* `frontend/src/components/register/SearchBar.tsx`
* `frontend/src/api/products.ts`
