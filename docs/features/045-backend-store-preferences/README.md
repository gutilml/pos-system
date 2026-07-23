# Feature 045 — Backend Store Preferences / Settings API

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — JUnit green.

## Behavior

* Durable store-scoped preference/config in PostgreSQL (`store_settings.preferences` JSONB).
* Keep boolean opt-ins in `features`; non-boolean topics (e.g. `ui_locale`) live in `preferences`.
* Authenticated `GET` / `PATCH` `/api/v1/stores/{storeId}/settings` (caller’s store only).
* Surface `uiLocale` on login and `/auth/me` for SPA bootstrap.
* Unlocks Feature **046** (EN/ES UI). Org-level prefs deferred until multi-org tenancy.

## Migration (existing DBs)

```sql
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;
```

Then set a default locale if needed:

```sql
UPDATE store_settings
SET preferences = COALESCE(preferences, '{}'::jsonb) || '{"ui_locale": "en"}'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';
```

## Key files

* `docs/database-schema.sql`, `docs/seed-data.sql`
* `backend/.../models/StoreSettings.java`
* `StoreSettingsController` / `StoreSettingsServiceImpl`
* `UserResponseDTO` + `AuthService.toResponse`
* Tests: repository, service, controller, auth

## Depends on / follow-ups

* Depends on: Feature 002 (`StoreSettings`), Feature 025 (auth), Feature 042 (`features` / `/me` patterns).
* Follow-up FE: Feature **046**.
* Later: org-level preferences when organizations exist; more preference keys (e.g. default tax rate).
