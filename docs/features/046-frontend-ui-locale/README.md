# Feature 046 — Frontend UI Locale (EN / ES)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. Depends on Feature **045**.

## Behavior

* Spanish/English UI labels driven by store `uiLocale` from Feature 045 (DB), not `localStorage` as source of truth.
* Hydrate from login/`/me`; CashierMenu EN/ES switch PATCHes store preferences so all terminals for that store share the language.
* Product/customer names stay API data (not translated).

## Coverage (v1 dictionaries)

Login, Cashier menu (incl. language), register title/empty cart, search placeholder/errors, cart headers/row chrome, footer totals/actions/discount modal, checkout modal primary labels/tenders empty state/add tender, open-shift modal chrome.

## Key files

* `frontend/src/api/auth.ts`, `frontend/src/api/storeSettings.ts`
* `frontend/src/i18n/` (`locale`, `messages`, `useT`)
* `useAuthStore.setLocaleAndPersist`
* `CashierMenu`, register/shift/auth/checkout label surfaces
* Vitest: `messages.test.ts`, `CashierMenu.locale.test.tsx`
