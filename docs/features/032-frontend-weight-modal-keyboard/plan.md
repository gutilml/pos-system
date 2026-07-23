# Implementation Plan - Frontend Weight Modal Keyboard Input

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None.

## Frontend Architecture

### `WeightModal.tsx`

* Drop `readOnly` on the weight `<input>`.
* Wire `onChange` to sanitize/update `weightInput` (allow digits + a single `.`; mirror numpad rules where practical so pad and keyboard stay consistent).
* On `pending` becoming set: `useEffect` + ref to `.focus()` the input (and reset value as today).
* Keep numpad `appendKey`, scale `handleReadScale`, Confirm / Cancel unchanged at the store layer (`confirmWeight` / `clearPendingWeight`).

### Tests — `WeightModal.test.tsx`

* Simulate typing into the input (userEvent / fireEvent) and assert Confirm enables / calls `confirmWeight` with the typed value.
* Regression: numpad still works.

## Additional Considerations

* Do not invent a separate qty formatter here; money labels may still show 4 dp until Feature 033.
* Escape / focus-return to search is Feature 034 — do not expand scope unless already trivial.
* FE/BE separation: no Java changes.
