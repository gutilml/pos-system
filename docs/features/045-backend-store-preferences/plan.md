# Implementation Plan - Backend Store Preferences / Settings API

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

### Schema & entity

* `docs/database-schema.sql`: add `preferences JSONB NOT NULL DEFAULT '{}'::jsonb` on `store_settings`.
* `StoreSettings.java`: field `Map<String, Object> preferences` with `@Type(JsonType.class)` (mirror `features` mapping; columnDefinition compatible with validate).
* README migration snippet:

```sql
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;
```

* `docs/seed-data.sql`: extend demo INSERT preferences, e.g. `'{"ui_locale": "en"}'::jsonb`.

### DTOs

* `StoreSettingsDTO` — `UUID storeId`, `String storeName`, `Map<String, Boolean> features`, `Map<String, Object> preferences` (optional convenience `String uiLocale`).
* `UpdateStoreSettingsRequest` — optional `Map<String, Boolean> features`, optional `Map<String, Object> preferences`.

### Service

* `StoreSettingsService` / `StoreSettingsServiceImpl` in `com.pos.core`:
  * `getSettings(UUID storeId, User caller)` — load store; enforce caller.storeId equality; 404 otherwise.
  * `patchSettings(UUID storeId, UpdateStoreSettingsRequest, User caller)` — same tenancy; merge maps; validate `ui_locale` ∈ {en, es}; save.
* Prefer resolving caller via existing security principal + `UserRepository` (same pattern as `AuthService.me`).

### Controller

* `StoreSettingsController` — `@RequestMapping("/api/v1/stores")`
  * `GET /{storeId}/settings`
  * `PATCH /{storeId}/settings`
* No SecurityConfig permitAll changes — authenticated only; CSRF applies to PATCH via existing filter chain.

### Auth

* Extend `UserResponseDTO` with `String uiLocale`.
* `AuthService.toResponse`: read preferences; normalize to `en`/`es`.
* Update all `new UserResponseDTO(...)` test call sites.

### Tests

* `StoreSettingsRepositoryTest` — save/load preferences JSONB.
* `StoreSettingsServiceImplTest` — merge, validation, tenancy.
* `StoreSettingsControllerTest` (or MockMvc security IT) — GET/PATCH happy path + 404 cross-store + 400 bad locale.
* `AuthServiceTest` / `AuthSecurityIntegrationTest` — `uiLocale` on `/me` and login.

## Frontend Architecture

None in this feature. Feature **046** consumes the API and `uiLocale`.

## Additional Considerations

* **Why not overload `features`?** It is typed `Map<String, Boolean>` for opt-in modules; locale/tax/etc. need non-booleans. Separate `preferences` matches PROJECT_CONTEXT JSONB tenant settings without breaking Feature 005/012/042.
* **Org later:** When organizations exist, either inherit org defaults → store overrides, or add `organization_settings.preferences`; store API remains the register’s source of truth for the active store.
* **Tax rate pending item** can later use `preferences.default_tax_rate` without a new column.
* FE/BE separation: commit backend-only.
