# Feature 101 — E2E register smoke (regression)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — extends existing regression suites (not default `mvn test` / `npm test`).

## Summary

Smoke path: open shift → unit sale → **weight sale** → close shift → list → reimburse (BE MockMvc regression), plus FE cart weight-confirm + API call smoke (`npm run test:regression`).

## How to run

```bash
# Backend (from backend/)
mvn test -Dgroups=regression -Dpos.excludedGroups=

# Frontend (from frontend/)
npm run test:regression
```

## Out of scope

Browser Playwright against live `:5173` / `:8080` (future). This feature uses the project’s tagged regression pattern.
