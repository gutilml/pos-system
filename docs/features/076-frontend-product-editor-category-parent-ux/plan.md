# Implementation Plan - Frontend product editor category, parent & weight UOM UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

Single FE feature **076**; one commit `feat(076): …` after tests/docs.

## Frontend Architecture

1. `childCostFromParentPreview` in `productPricing.ts` (mirror BE formula; fallback same-unit on conversion failure).
2. Searchable pickers for category (trailing Add) and parent.
3. Inline category create via `createCategory`.
4. Parent select → derived cost, inventory lock, weight UOM prefill.
5. Separate sell `unitOfMeasure` chip state from packaging `packageUnit`.

## Backend Architecture

None planned.
