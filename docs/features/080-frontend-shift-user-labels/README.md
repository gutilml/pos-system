# Feature 080 — Frontend shift user labels

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. Small BE DTO enrichment (`openedByUsername` / `closedByUsername`) shipped with this feature so labels can show usernames, not only UUIDs.

## Summary

Show opener/closer usernames on the shift close ticket and shift history detail. Legacy shifts without stamps show “—”.

## Depends on

BE **079** audit stamps (+ username resolution on shift DTOs).

## Out of scope

* Changing shift open/close rules; user management UI.
