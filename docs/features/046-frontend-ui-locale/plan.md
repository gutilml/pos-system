# Implementation Plan - Frontend UI Locale (EN/ES)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Requires Feature 045 shipped (or mocked in Vitest).

## Frontend Architecture

### API

* Extend `AuthUser` in `frontend/src/api/auth.ts` with `uiLocale?: 'en' | 'es' | string`.
* Add `frontend/src/api/storeSettings.ts`: `fetchStoreSettings(storeId)`, `patchStoreSettings(storeId, body)` via `apiFetch` + CSRF on PATCH.

### State

* Prefer extending `useAuthStore` with locale derived from `user.uiLocale`, plus `setLocaleAndPersist(next)` that PATCHes then updates user snapshot.
* Or small `useLocaleStore` fed from auth bootstrap — avoid dual sources; auth user remains canonical after fetch.

### i18n module

* Message maps + `t(key: string, locale)` (simple nested or flat keys).
* Hook `useT()` reading current locale from auth/locale store.
* Replace user-visible literals in: `LoginForm`, `ShiftGate` / open-close modals, `CashierMenu`, `SearchBar`, cart headers/`CartItemRow`, `CheckoutFooter`, `CheckoutModal` primary labels, weight modal chrome.

### Menu UX

* `CashierMenu`: “Language” / “Idioma” with EN and ES actions (`data-testid` for tests).

## Additional Considerations

* Keep Tailwind/layout unchanged; only string swaps.
* Product/customer names remain server data.
* If PATCH fails offline, keep prior locale and surface failure — do not silently fall back to localStorage persistence.
* FE/BE separation: commit frontend-only after 045.
