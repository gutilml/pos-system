# Feature 051 — Backend Categories CRUD

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — `/api/v1/categories` CRUD with margin validation and product-link delete guard.

## Summary

Public CRUD for `categories` (name + `targetMargin`) so Feature **050** margin hierarchy can use category defaults. Soft-delete or hard-delete policy documented in spec.

## Depends on

* Entities from Feature 002/003; unlocks product margin UI (**053**) and clean defaults for **050**.

## Out of scope

* Org-level categories; FE admin (**053**).
