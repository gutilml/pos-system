# Implementation Plan - Frontend Product & Category Admin

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Frontend Architecture

* Routes under authenticated shell (e.g. `/admin/products`, `/admin/categories`) — exact nav placement TBD (Cashier menu link acceptable until role gating).
* API clients for products + categories; reuse auth `apiFetch`.
* Shared money/margin helpers aligned with backend formula.
* Component tests for margin sync and parent popup.

## Sequencing

Implement only after **050** and **051** are Done; **052** can land in parallel or before UI without blocking form CRUD.
