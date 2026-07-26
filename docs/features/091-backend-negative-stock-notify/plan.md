# Plan — 091 Backend negative-stock notify

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Choose channel (email / in-app event / webhook).
2. Hook inventory deduct path; enqueue notify.
3. Tests with inventory on/off; unlock FE **092**.
