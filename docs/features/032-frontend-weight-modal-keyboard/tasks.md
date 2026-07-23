# Task Checklist — Feature 032 Frontend Weight Modal Keyboard Input

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Make `#weight-input` editable (`onChange`, no `readOnly`) in `WeightModal.tsx`.
- [x] 2. Autofocus weight input when `pendingWeightProduct` is set.
- [x] 3. Align keyboard sanitization with numpad rules (single decimal, etc.).
- [x] 4. Document README; promote pending item with Feature 032 path; update `docs/README.md`.

## Test Tasks

- [x] 5. Vitest: keyboard entry enables Confirm and calls `confirmWeight` with parsed weight; numpad regression.
