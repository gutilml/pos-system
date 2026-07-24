# Feature: Frontend Product & Category Admin UI

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Build SPA admin flows for product create/update and category management against Features 050–051 APIs. Mirror the agreed form: barcodes optional, unit vs bulk, parent link with completeness popup, cost/margin/retail/wholesale, inventory fields only when store inventory is on. EN/ES via existing i18n.

## User Stories

* As a user, I want to create and edit products in the POS SPA so I am not limited to SQL/seed.
* As a user linking a bulk item to a parent, I want a popup to fill parent package unit/qty when missing.
* As a user, I want category margins editable so product pricing defaults stay correct.

## Scope

* **Strictly Frontend** after BE 050/051 are available.
* **Out of scope:** Implementing 050–052 APIs; role-based hiding (show to all authenticated for now).

## UX Rules

* Hide inventory block when `!enableInventory`.
* Editing margin recalculates retail; editing retail recalculates margin (client-side preview + server authoritative).
* Child cost display derived/read-only when parent linked (from API).
* Parent incomplete → modal to PATCH parent package fields, then retry link.
* i18n for all chrome (Feature 049 patterns).

## Acceptance Criteria

1. [x] Product create/edit form covers 050 fields; calls create/update APIs.
2. [x] Category list/create/edit wired to 051.
3. [x] Inventory section gated; parent package popup works.
4. [x] Margin ↔ price UX; Vitest for key form behaviors.
5. [x] Pending + catalog updated.
