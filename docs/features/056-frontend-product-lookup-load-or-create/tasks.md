# Task Checklist — Feature 056 Frontend Product Lookup Load-or-Create

## Frontend Tasks

- [x] 1. Add `looksLikeBarcode` helper + unit tests (digit-only, length ≥ 4).
- [x] 2. Build Product-tab lookup UI; wire `searchProducts`; resolve exact vs first hit; open edit or create.
- [x] 3. Extend `ProductEditorForm` with create prefills (`initialName` / `initialSkusText`); reset to lookup after save/cancel.
- [x] 4. Demote/remove competing list-first Product UI from 055.
- [x] 5. EN/ES strings for lookup chrome; Vitest for load-or-create paths.
- [x] 6. On ship: README Status Done; pending frontend 056 checked; docs/README.md catalog Done.

## Test Tasks

- [x] 7. Vitest: heuristic + found/edit vs not-found/create prefills.
