# Feature 113 — Register Customer Only Below Total

## Status

**Done** — Assigned customer name shows only under Total; removed from beside Assign/Change.

## Summary

`AssignCustomerControl` no longer renders the truncated `header-customer` chip. `CheckoutFooter` still shows `footer-customer` below Total. Button label still switches between Assign and Change.

## Key files

- `frontend/src/components/register/AssignCustomerControl.tsx`
- `frontend/src/components/register/AssignCustomerControl.test.tsx`
