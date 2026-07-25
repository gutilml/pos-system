# Plan — 075 Frontend customer has-credit checkbox

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. [x] State `hasCredit` in CustomersWorkspace; sync on select/create.
2. [x] Conditionally render limit + save `creditLimit` 0 when false.
3. [x] Validate cannot disable credit with balance > 0.
4. [x] Tests + i18n + docs Done; commit `feat(075): …`.
