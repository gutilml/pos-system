# Feature: Frontend UI Locale Remaining Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Close the remaining EN/ES gaps after Features 046/048 so cashier popups (Pay credit gate, Close Shift, Pay in/out, Weight, sale/close tickets, auth/shift gates) render Spanish when store `uiLocale` is `es`.

## User Stories

* As a cashier in Spanish, I want Pay / shift / drawer / weight popups fully in Spanish so no mixed-language dialogs interrupt the sale.
* As a cashier, I want tender method labels and print tickets in the active UI language.

## Scope

* **Strictly Frontend:** `frontend/` (+ docs).
* **Depends on:** 046/048 i18n plumbing.
* **Out of scope:** Backend; Stripe QR modal (on hold); translating catalog names; inventing `t(key, vars)` unless needed for a few static strings.

## Acceptance Criteria

1. [x] Checkout credit-gate + Clear/available credit + tender method labels use dictionaries.
2. [x] Close Shift, Drawer (Pay in/out), Open Shift hint/validation use dictionaries.
3. [x] Weight modal visible chrome uses dictionaries (existing `weight.*` + extensions).
4. [x] Sale ticket + Shift close ticket Print/Done and labels use dictionaries.
5. [x] AuthGate / ShiftGate loading and error chrome use dictionaries.
6. [x] Vitest updated for any broken English queries; at least one ES assertion on a former-English popup.
7. [x] Pending + `docs/README.md` updated for 049.
