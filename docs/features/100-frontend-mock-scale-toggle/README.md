# Feature 100 — Frontend mock scale toggle

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. FE-only; no backend.

## Summary

Settings **Mock scale** toggle (browser `localStorage`) makes `WeightModal` auto-fill a fixed fake weight without Web Serial. Register Connect banner is suppressed while mock is on. Real-scale Feature 099 behavior is unchanged when the toggle is off.

## Out of scope

Virtual COM / OS drivers; live weight streaming; editable mock weight; backend store flag; role-gating.
