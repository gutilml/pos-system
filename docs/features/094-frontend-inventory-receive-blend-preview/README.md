# Feature 094 — Frontend inventory receive blend preview

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. Extends Feature **066** lot preview with post-blend product prices (Feature **062** WAC).

## Summary

Receive modal keeps editable **incoming lot** cost/selling/wholesale (margin-derived as in **066**). A read-only **After this receive** panel shows the weighted-average product cost/selling/wholesale that will be persisted after Guardar, matching the product editor.

## Unlocks

None (UX clarity).

## Out of scope

* Backend blend changes (**062**); adjust mode; overwriting product prices with lot prices.
