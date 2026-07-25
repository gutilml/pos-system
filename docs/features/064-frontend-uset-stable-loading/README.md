# Feature 064 — Frontend stabilize useT

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — `useT` identity stable across re-renders when locale unchanged.

## Summary

`useT()` previously returned a new function every render, which broke `useCallback`/`useEffect` deps in Customers and Inventory workspaces (endless Loading / refetch). Wrap the translator in `useCallback` keyed on locale.

## Depends on / unlocks

* Unlocks reliable Customers/Inventory list loading; reduces “Failed to fetch” noise from request storms.

## Out of scope

* Login error message (**065**); inventory receive price preview (**066**); customer pay modal (**068**).
