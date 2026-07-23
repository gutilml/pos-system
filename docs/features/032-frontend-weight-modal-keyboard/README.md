# Feature 032 — Frontend Weight Modal Keyboard Input

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* `#weight-input` is editable (no `readOnly`); typed digits/decimal sanitized like the numpad.
* Autofocus when a pending weight product appears; Enter confirms when valid.
* On-screen numpad and “Read from Scale” unchanged.

## Key files

* `frontend/src/components/register/WeightModal.tsx`
* `frontend/src/components/register/WeightModal.test.tsx`

## Out of scope

Search focus restore (034); money display scale (033).
