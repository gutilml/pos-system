# Feature: Frontend parent package editor guards

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Stop cashiers from marking children of `pc` parents as sell-by-weight (which opened the scale modal). Improve create flow: parent under barcodes; preload category; lock incompatible weight option.

## Acceptance Criteria

1. [x] Parent field immediately below barcodes.
2. [x] Parent unit `pc` → sellByWeight forced off and disabled.
3. [x] Non-pc parent → sellByWeight still available.
4. [x] Category copied from parent, still editable; cost read-only derived.
5. [x] Vitest + catalog Done.
