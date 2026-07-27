# Feature: Frontend single unit chip row

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Remove the duplicate Package unit / Unit of measure chip rows. One shared selection drives `packageUnit` (no parent) and/or `unitOfMeasure` (sell by weight).

## Acceptance Criteria

1. [x] Top-level product with sell-by-weight shows a single chip group (package-unit chips), not two.
2. [x] Child with sell-by-weight (non-pc parent) shows one UoM chip group; package chips hidden.
3. [x] `pc` remains available; save maps shared unit to API fields correctly.
4. [x] Vitest + catalog Done.
