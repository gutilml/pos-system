# Implementation Plan - Backend Categories CRUD

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

* `CategoryController` + service + DTOs (`CategoryDTO`, request bodies).
* Reuse `CategoryRepository`; wire into Security as authenticated (no role split yet).
* Align `targetMargin` scale with DB `DECIMAL(5,4)`.

## Tests

Controller/service tests; optional repository test.
