# Feature: Frontend Search / Scan Focus Lock

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Scanner-first selling depends on the search field owning keyboard focus whenever the cashier is not interacting with a modal. Today `SearchBar` only autofocuses on mount, so after weight/pay/menu flows focus often lands elsewhere and the next scan is lost.

## User Stories

* As a cashier, I want the search box focused between scans so barcode wedges keep working without clicking the field.
* As a cashier, I want focus to return to search after I close or Escape a modal so I can continue selling immediately.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Out of scope:** Typeahead suggestions (035); changing modal open/close product logic; global app-wide focus manager outside the register shell.

## UX & Business Rules

* **Lock when idle:** If no register-blocking modal is open, keep `#register-search` focused (re-focus on blur only when appropriate — e.g. ignore blur when focus moved into a modal or intentional non-modal control that must accept input such as cart qty / discount fields).
* **Clarify intentional exceptions:** Cart line qty steppers, item/global discount inputs, and ticket tabs must remain usable — do not yank focus away while the cashier is editing those controls. Prefer: restore search focus when those controls blur, and always after modal close.
* **Modals:** Weight, checkout/pay, drawer pay-in/out, close-shift, and similar overlays suppress search re-focus while open; on close / Escape / successful dismiss, refocus search.
* After successful product add from search, keep focusing search (already partially done).

## Acceptance Criteria

1. [ ] With no modal open, after adding an item, search retains or regains focus.
2. [ ] Opening weight or checkout modal does not fight the modal’s own focus target.
3. [ ] Closing those modals (Cancel, Confirm, Escape where supported, or complete sale) returns focus to `#register-search`.
4. [ ] Cashier can edit cart qty / discount fields without immediate focus steal; leaving those fields restores search focus (or equivalent documented behavior).
5. [ ] Vitest (and/or focused integration tests) cover modal open/close focus return.
6. [ ] Pending “Search/scan focus lock” notes Feature 034; `docs/README.md` updated.
