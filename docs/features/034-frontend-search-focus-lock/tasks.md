# Task Checklist — Feature 034 Frontend Search / Scan Focus Lock

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add register search focus helper / imperative focus API on `SearchBar`.
- [x] 2. Suppress search re-focus while weight / checkout / shift modals are open.
- [x] 3. Restore search focus on modal close / Escape / successful dismiss paths.
- [x] 4. Allow cart qty / discount editing without hostile focus steal; restore on blur.
- [x] 5. Document README; promote pending item with Feature 034; update `docs/README.md`.

## Test Tasks

- [x] 6. Vitest: focus returns to `#register-search` after weight and checkout modal close.
