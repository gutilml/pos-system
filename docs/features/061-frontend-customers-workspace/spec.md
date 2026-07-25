# Feature: Frontend Customers Workspace

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Ship the Customers workspace: always-visible nav content with a searchable list (loaded on mount), create/edit/delete against Feature **060** APIs, and credit ledger/pay UI only when `enableCustomerCredit` is true. Polish Register assign button idle label for EN/ES clarity.

## User Stories

* As a cashier, I want to browse and manage customers from the Customers workspace without leaving the POS shell.
* As a cashier with credit enabled, I want to see ledger history and record a balance payment.
* As a cashier, I want the header button to say Assign customer so it is not confused with the Customers workspace.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** **060**, **054**.
* **Out of scope:** Backend; Register assign-from-workspace; inventory workspace.

## UX & business rules

1. List loads with empty `q` (max 20); typing filters via search API.
2. Select row → detail; New → blank create form.
3. Credit off: hide limit, balance, ledger, pay.
4. Credit on: show those; ledger newest-first with date order toggle; pay amount only.
5. Delete with confirm; show API error if balance ≠ 0.
6. Idle assign button: Assign customer / Asignar cliente; keep Change customer when assigned.
7. Full EN/ES for new chrome.

## Acceptance Criteria

1. [x] Customers workspace replaces coming soon.
2. [x] List/filter/create/edit/delete work against 060 APIs.
3. [x] Credit UI gated by `enableCustomerCredit`.
4. [x] Assign button idle label updated.
5. [x] Vitest + pending + catalog updated.
