# Feature: Frontend stabilize useT

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Make `useT` safe to list in React dependency arrays so workspace list effects do not re-fire every render.

## User Stories

* As a cashier, I want Customers and Inventory lists to finish loading so I can work.

## Scope

* **Strictly Frontend:** `frontend/src/i18n/useT.ts` (+ tests, docs).
* **Out of scope:** Changing workspace fetch logic beyond depending on stable `t`.

## Acceptance Criteria

1. [x] `useT` returns the same function reference when locale is unchanged.
2. [x] Locale change yields a new translator.
3. [x] Vitest + pending + catalog updated.
