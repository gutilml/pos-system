# Feature 102 — Frontend single unit chip row

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. FE-only.

## Summary

Product editor shows **one** unit chip row (`pc` · `kg` · `g` · `lb` · `L` · `ml`). Selecting `pc` is allowed; scale is unused for those products. Parent-`pc` + sell-by-weight remains blocked by Feature **098**.

## Out of scope

Backend allowlist changes; splitting package vs sell chip sets.
