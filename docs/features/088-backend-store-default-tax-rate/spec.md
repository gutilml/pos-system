# Feature: Backend store default tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cart tax today is request-only. Persist a store default in `preferences.default_tax_rate` (Feature **045** allowlist) and expose it on settings GET/PATCH (and optionally `/me`) so the SPA can hydrate checkout.

## User Stories

* As an admin, I want to set the store’s default tax rate in settings.
* As a cashier, I want checkout to use the store default without picking a rate per ticket (v1).

## Scope

* **Strictly Backend:** preferences allowlist + settings/me DTOs.
* **Depends on:** Feature **045**.
* **Unlocks:** FE **089**.

## APIs

* `GET` / `PATCH` `/api/v1/stores/{storeId}/settings` — read/write `preferences.default_tax_rate` (decimal fraction or percent — document in impl; validate range).
* Optional: include `defaultTaxRate` on `/auth/me` / login payload for bootstrap.
* Checkout `POST /transactions` continues to accept `taxRate` from client (cart), sourced from store in FE **089** — no server-side per-ticket override UI/API in v1.

## Locked defaults (v1)

* Hydrate cart from store preference; **no** per-ticket tax override UI.
* Checkout POST uses cart `taxRate` (from store).

## Acceptance Criteria

1. [x] `default_tax_rate` allowlisted and persisted in preferences JSON.
2. [x] Settings GET/PATCH round-trip; invalid values rejected.
3. [x] Optional `/me` exposure if implemented in this slice.
4. [x] JUnit; pending/catalog when Done.
