# Implementation Plan - Frontend Search / Scan Focus Lock

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None.

## Frontend Architecture

### Approach

Prefer a small register-scoped helper (e.g. `useRegisterSearchFocus`) rather than scattering `inputRef.focus()` calls:

* `SearchBar` exposes a stable `focus()` via ref/imperative handle **or** listens for a custom event / store flag `requestSearchFocus`.
* `RegisterScreen` (or modal parents) call “release focus to search” when `WeightModal` clears pending, when `CheckoutModal` closes, when drawer/close-shift modals dismiss.

### Modal awareness

* Derive “modal open” from existing state: `pendingWeightProduct`, checkout `open`, shift modal open flags in `CashierMenu` / `ShiftGate` children.
* While any blocking overlay is open, disable search blur-refocus loop.

### Cart / discount fields

* Do not use a naive `window`-level focus trap that refocuses search on every blur.
* Pattern: on `document` `focusin`, if target is outside search and outside an open modal and outside known editable cart controls, optionally no-op; on blur of cart controls, schedule `requestAnimationFrame` / `setTimeout(0)` to refocus search if no modal opened.

Keep the implementation as simple as possible while meeting AC — document chosen exceptions in the README.

### Tests

* Render register slice with mocked store; open/close weight pending; assert `document.activeElement` is the search input after close.
* Checkout modal close → search focused.

## Additional Considerations

* Feature 035 typeahead dropdown must not break focus lock (listbox focus vs input — keep focus on input while navigating with arrows if implemented later).
* Coordinate with 032 (weight input autofocus) — modal open wins over search lock.
* FE/BE separation: no Java changes.
