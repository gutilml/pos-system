# Feature 065 — Frontend friendly login error

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Problem Details `detail` extracted in `http.ts`; login maps invalid credentials to EN/ES.

## Summary

Bad login no longer shows raw RFC 7807 JSON. `parseJson` surfaces `detail`; LoginForm maps “Invalid credentials” to `login.invalidCredentials`.

## Out of scope

* Backend auth message changes; full i18n of every API error.
