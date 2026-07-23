# Feature: Frontend UI Locale (EN/ES) via Store Preferences

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Ship Spanish/English UI labels on the register, driven by the store’s durable `ui_locale` preference from Feature 045—not `localStorage` as source of truth. Hydrate locale from login/`/me`, allow cashiers to switch EN/ES (e.g. Cashier menu), and PATCH the store settings API so every device for that store sees the same language after refresh.

## User Stories

* As a cashier, I want register labels in English or Spanish so I can work in my preferred language.
* As a merchant, I want that choice saved for the store in the backend so another terminal does not stay stuck in the wrong language.
* As a cashier, I want the UI language to apply after login without a manual per-browser setup step.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs + `docs/README.md`).
* **Depends on:** Feature **045** (`uiLocale` on `/me`; GET/PATCH `/api/v1/stores/{storeId}/settings`).
* **Out of scope:** Backend changes; translating catalog/product/customer names; organization picker; mandatory `react-i18next` (prefer lightweight `t()` + message maps unless complexity forces otherwise).

### Minimum label coverage (v1)

Primary register chrome: search, cart headers, footer actions, Pay modal primary labels, shift gate/open/close, Cashier menu, login form. Receipt/print copy best-effort same dictionaries. Deeper/admin-only strings may follow in a later polish if listed in README.

## UX & Business Rules

### Source of truth

* Locale comes from `AuthUser.uiLocale` after bootstrap/login/`fetchMe`.
* Changing language: optimistic UI update + `PATCH .../settings` with `{ preferences: { ui_locale: "en"|"es" } }` using `selectStoreId`; on failure, revert and show existing error patterns.
* **Do not** use `localStorage` as the durable store for locale. Optional in-memory/Zustand only is fine; rehydrate from API on each auth bootstrap.

### UI control

* Add EN | ES control under `CashierMenu`.
* Login: English-only or static bilingual is acceptable pre-auth; apply store locale after authenticated bootstrap (default recommendation).

### Dictionaries

* `frontend/src/i18n/` (or `lib/i18n/`): `en.ts`, `es.ts`, `t(key)`, `Locale` type `'en' | 'es'`.
* Wire high-traffic register/shift/auth strings through `t()`.

## Acceptance Criteria

1. [x] After login/`fetchMe`, UI labels use store `uiLocale` (`en`/`es`; missing → `en`).
2. [x] Cashier can switch EN/ES; PATCH persists; reload/new session shows the same locale from API.
3. [x] No `localStorage` (or similar) as locale source of truth.
4. [x] Core register/shift/login strings covered by EN and ES dictionaries (list in README).
5. [x] Vitest covers locale hydration, toggle → PATCH mock, and at least one labeled control rendering translated text.
6. [x] Pending frontend note + `docs/README.md` updated; triad path recorded.
