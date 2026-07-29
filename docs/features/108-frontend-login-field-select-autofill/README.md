# Feature 108 — Frontend Login Field Select + Autofill Submit

## Status

**Done** — Username and password select-all on focus; submit reads live form values for browser autofill.

## Summary

- Focus on a non-empty username/password field selects all text so typing replaces it.
- Submit uses `FormData` from the form so autofilled values work even when React `onChange` never fired.

## Key files

- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/components/auth/LoginForm.test.tsx`
