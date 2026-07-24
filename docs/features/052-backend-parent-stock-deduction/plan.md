# Implementation Plan - Backend Parent Stock Deduction

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

* Hook into Feature 005 stock deduction inside transaction completion.
* Shared unit-conversion helper with Feature 050 (extract to a small domain utility).
* Lock parent row when decrementing to avoid race conditions (DB-level or pessimistic lock).

## Tests

Integration/service tests: bottle case, rice kg, no parent, inventory off, insufficient stock.
