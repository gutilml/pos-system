# Feature: Frontend CARD reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Enable Previous tickets reimburse flow for CARD sales when the backend policy allows, replacing the hard block in **073**.

## User Stories

* As a cashier, I want to reimburse a CARD ticket from Previous tickets when policy allows.
* As a cashier, I want clear messaging when CARD refund requires a manual terminal step.

## Scope

* **Strictly Frontend:** closed-tickets reimburse UI.
* **Depends on:** BE **084**.
* **Unlocks:** none.

## UX

* Remove/relax CARD blocked state when API supports CARD reimburse.
* Show policy-driven copy (e.g. “complete refund on terminal”).
* EN/ES.

## Acceptance Criteria

1. [ ] CARD tickets can enter reimburse flow when BE allows.
2. [ ] Policy messaging shown when required.
3. [ ] CASH/CREDIT-only path unchanged.
4. [ ] Component tests; pending/catalog when Done.
