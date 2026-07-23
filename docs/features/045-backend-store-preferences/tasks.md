# Task Checklist — Feature 045 Backend Store Preferences

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- [x] 1. Update `docs/database-schema.sql` + `StoreSettings` entity with `preferences`; document ALTER for existing DBs in README.
- [x] 2. Update `docs/seed-data.sql` demo store preferences (`ui_locale`).
- [x] 3. Add `StoreSettingsDTO`, `UpdateStoreSettingsRequest`, `StoreSettingsService`(+Impl), `StoreSettingsController`.
- [x] 4. Enforce caller-store tenancy on GET/PATCH; validate `ui_locale`; merge maps on PATCH.
- [x] 5. Add `uiLocale` to `UserResponseDTO`; map in `AuthService.toResponse`; fix test constructors.
- [x] 6. Repository/service/controller (+ auth) tests; `./mvnw test` green.
- [x] 7. Write `docs/features/045-backend-store-preferences/README.md`; mark pending “Store settings API” with triad path; update `docs/README.md`.

## Frontend Tasks

- None (Feature 046).

## Test Tasks

- [x] 8. Cover missing preferences → default `en`; PATCH persist; cross-store 404; invalid locale 400.
