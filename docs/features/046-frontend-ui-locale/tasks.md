# Task Checklist — Feature 046 Frontend UI Locale

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None (Feature 045).

## Frontend Tasks

- [x] 1. Add `uiLocale` to `AuthUser`; parse on login/`fetchMe`.
- [x] 2. Add `storeSettings` API client (GET/PATCH).
- [x] 3. Add lightweight `i18n` dictionaries + `t` / `useT`.
- [x] 4. Hydrate locale from auth; CashierMenu EN/ES → PATCH preferences; update local user/locale state.
- [x] 5. Replace core register/shift/auth labels with `t(...)`.
- [x] 6. Vitest: hydration, menu toggle + mocked PATCH, sample translated assertions.
- [x] 7. README + pending frontend + `docs/README.md` catalog/topic.

## Test Tasks

- [x] 8. Assert no reliance on localStorage for locale in tests (bootstrap from mocked `/me` only).
