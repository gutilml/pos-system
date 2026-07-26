# Feature: Backend multi-tier pricing

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Vision: price lists by customer or tier beyond the **015** discount cascade. No schema or API design yet — triad is a placeholder until product designs tiers.

## User Stories

* As a merchant, I want certain customers or tiers to see different unit prices (TBD).

## Scope

* **Strictly Backend** (when designed).
* **Depends on:** catalog pricing; **015** remains for % discounts unless replaced.
* **Unlocks:** FE companion TBD later.

## APIs

* TBD after design (price list tables, resolve price at add-to-cart / checkout).

## Acceptance Criteria

1. [ ] Product design complete (tiers, precedence vs discounts).
2. [ ] APIs + schema implemented per design.
3. [ ] JUnit; pending/catalog when Done.
4. [ ] FE companion triad numbered when scoped.
