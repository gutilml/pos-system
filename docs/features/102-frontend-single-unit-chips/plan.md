# Plan — 102 Frontend single unit chip row

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Replace dual `packageUnit` / `unitOfMeasure` UI state with `unitCode`.
2. Render one `UnitChips`: package legend when no parent; UoM legend when child + sellByWeight.
3. `buildBody` sends the same code to both DTO fields when applicable.
4. Tests + triad.
