# Plan — 074 Frontend product editor category margin units

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. `onCategoryChange`: set categoryId + margin from categories list; call shared `recalcSellingFromCostAndMargin`.
2. `onCostChange`: set cost; recalc selling when margin valid.
3. Replace UOM + package text inputs with `PACKAGE_UNITS` chip row; wire `packageUnit` state.
4. `buildBody`: `unitOfMeasure: null`, `packageUnit` from selection.
5. Tests + i18n + docs Done; commit `feat(074): …`.
