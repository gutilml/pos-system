# Feature: Frontend store tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Replace local/default cart `taxRate` with the store preference from **088**. Cashiers do not override tax per ticket in v1. Checkout continues to POST cart `taxRate`.

## User Stories

* As a cashier, I want cart tax to match the store default automatically.
* As an admin, I want to edit the store tax rate in settings when that UI exists.

## Scope

* **Strictly Frontend:** cart store + optional settings form.
* **Depends on:** BE **088**.
* **Unlocks:** none.

## UX

* On login / settings load: set `useCartStore.taxRate` from `defaultTaxRate` / preferences.
* **No** per-ticket tax control in register footer or pay modal (v1 locked).
* If a settings screen exists, allow editing default tax rate via PATCH settings.
* EN/ES for settings labels.

## Acceptance Criteria

1. [x] Cart `taxRate` hydrates from store/me after auth.
2. [x] Checkout POST uses hydrated cart `taxRate`.
3. [x] No per-ticket override UI.
4. [x] Settings edit when settings UI exists; tests; pending/catalog when Done.
