# Feature: Backend Store Preferences / Settings API

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Add a durable, store-scoped preference/config channel in PostgreSQL so topics such as UI locale (and later tax defaults, etc.) survive devices and browsers. Keep existing boolean opt-in flags in `store_settings.features`; add a separate `preferences` JSONB map for non-boolean settings. Expose authenticated read/update APIs and surface `uiLocale` on `/auth/me` (and login) for SPA bootstrap. This replaces the rejected idea of device-only locale persistence.

## User Stories

* As a platform owner, I want preference/config topics stored per store in the database so settings are not tied to one browser.
* As a frontend developer, I want GET/PATCH store settings and `uiLocale` on `/me` so the register can hydrate and save locale without inventing ad-hoc storage.
* As a future implementer of multi-org tenancy, I want store-level prefs now with a clear extension path to org-level prefs later.

## Scope

* **Strictly Backend:** `backend/` + `docs/database-schema.sql` + `docs/seed-data.sql` + feature/pending docs + `docs/README.md`.
* **Depends on:** Feature 002 (`StoreSettings`), Feature 025 (auth / JWT store link), Feature 042 (`features` / `/me` patterns).
* **Out of scope:** React i18n (046); organization tables; full admin settings UI; changing how `enable_inventory` / `enable_customer_credit` gate modules (still `features`); user-level preferences; Flyway.

## Business Rules & Technical Constraints

### Schema

* Add `store_settings.preferences JSONB NOT NULL DEFAULT '{}'::jsonb`.
* Keep `features` as boolean opt-in map (`Map<String, Boolean>`).
* Map `preferences` via Hypersistence `JsonType` as `Map<String, Object>` (or equivalent JSON-compatible map).
* No Flyway: update `docs/database-schema.sql`; document one-shot `ALTER TABLE` in feature README for existing DBs (`ddl-auto: validate`).
* Seed demo store with at least `"ui_locale": "en"` in `preferences`.

### Known preference keys (v1)

| Key | Type | Allowed | Default if missing |
|-----|------|---------|-------------------|
| `ui_locale` | string | `en`, `es` | `en` |

* Unknown keys in stored JSON are preserved on read; PATCH **allowlists keys on write** (`ui_locale` in v1) so garbage does not accumulate.
* Invalid `ui_locale` values → `400` `BusinessRuleException`.

### REST

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `GET` | `/api/v1/stores/{storeId}/settings` | Authenticated | Return settings for that store |
| `PATCH` | `/api/v1/stores/{storeId}/settings` | Authenticated + CSRF | Merge partial `features` and/or `preferences` |

* **Tenancy (v1):** Caller may only access the store linked on their user (`user.store.id`). Mismatch → `404` (do not leak other stores). Null user store → `404`.
* Roles: ADMIN and CASHIER remain equal (both may PATCH), consistent with Auth v1.
* Response DTO includes: `storeId`, `storeName`, `features`, `preferences` (optional convenience `uiLocale` if documented).
* PATCH body: optional `features` map and/or `preferences` map; **merge** into existing maps (null body fields = no change). Do not wipe unspecified keys.

### Auth bootstrap

* Add `uiLocale` (`String`, `"en"` \| `"es"`) to `UserResponseDTO`.
* Resolve from `store.preferences["ui_locale"]`; missing/invalid → `"en"`.
* Populate via existing `AuthService.toResponse` on login and `/me`.

### Compatibility

* Additive column + new endpoints; existing `features` consumers unchanged.
* Update `StoreSettingsRepositoryTest` and add controller/service tests.

## Acceptance Criteria

1. [x] `docs/database-schema.sql` and entity `StoreSettings` include `preferences` JSONB; Hibernate validates.
2. [x] Seed includes demo `preferences.ui_locale`.
3. [x] `GET /api/v1/stores/{storeId}/settings` returns features + preferences for the caller’s store; other store IDs → 404.
4. [x] `PATCH` merges allowlisted preference updates (at least `ui_locale`); invalid locale → 400; persists across restart/reload.
5. [x] `GET /api/v1/auth/me` and login include `uiLocale` derived from store preferences.
6. [x] JUnit/Mockito (+ security integration as appropriate) cover GET/PATCH/tenancy/validation/`uiLocale`.
7. [x] Pending backend “Store settings API” promoted to this triad path; `docs/README.md` catalog/topic updated.
