# Plan — 089 Frontend store tax rate

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Read default tax from `/me` or settings GET; write into cart store on bootstrap.
2. Wire settings PATCH if admin settings UI exists; otherwise hydrate-only.
3. Ensure pay/checkout payload uses cart taxRate; no override controls.
4. Component/store tests; mark Done.
