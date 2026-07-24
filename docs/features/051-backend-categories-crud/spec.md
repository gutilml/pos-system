# Feature: Backend Categories CRUD

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Expose REST CRUD for categories: list, get, create, update, and deactivate/delete. Each category has `name` and `targetMargin` (fraction used in Feature 050 margin hierarchy between store default and product override).

## User Stories

* As a catalog operator, I want to manage categories and their default margins so new products inherit sensible pricing.
* As Feature 050, I need stable category IDs and margins for effective-margin resolution.

## Scope

* **Strictly Backend.**
* **Depends on:** existing `categories` / `product_category` tables.
* **Out of scope:** Frontend (**053**); multi-org category scopes.

## Business Rules

* `targetMargin` in `[0, 1)` same validation as product margin math (Feature 050).
* Prevent delete (or block) when products still reference the category — prefer **soft deactivate** if a flag is added, or reject delete while linked; choose one in implementation and document.
* List endpoint for pickers (active only by default).

## Acceptance Criteria

1. [ ] `GET/POST /api/v1/categories`, `GET/PUT/PATCH /api/v1/categories/{id}`, delete or deactivate.
2. [ ] Margin validation; name uniqueness rules documented (store-global vs global — match current schema: global categories today).
3. [ ] JUnit for CRUD + margin validation + delete/link guard.
4. [ ] Pending + catalog updated.
