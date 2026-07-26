# Plan — 081 Backend drawer event policy

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Lock product decisions: max amounts, reason rules, role gates.
2. Prefer store preferences or config constants for caps (align with **045** if prefs).
3. Enforce in `ShiftService` before persisting events.
4. Tests for reject/accept matrices; mark Done when product unblocks.
