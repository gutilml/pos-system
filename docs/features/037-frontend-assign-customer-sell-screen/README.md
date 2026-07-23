# Feature 037 — Frontend Assign Customer From Selling Screen

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Header **Customer** / **Change customer** opens a modal with `CustomerSearch`.
* Select sets ticket customer; **Clear** removes it; footer still shows assigned customer.
* Does not open Pay; CREDIT checkout can use the pre-assigned customer.

## Key files

* `frontend/src/components/register/AssignCustomerControl.tsx`
* `frontend/src/features/register/RegisterScreen.tsx`
