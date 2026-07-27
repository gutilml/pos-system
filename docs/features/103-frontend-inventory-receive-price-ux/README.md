# Feature 103 — Inventory modal focus + receive price UX

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. FE-only.

## Summary

Adjust/Receive modals focus **Quantity** on open. Receive shows a single **Cost / Price / Wholesale price** block (no After-this-receive panel): typing Cost is the incoming lot unit cost; after qty/blur, Cost shows the blended average; Price and Wholesale stay editable. Save still sends lot cost + reverse-engineered lot prices to the existing API.

## Out of scope

Backend blend changes; adjust-mode price editing.
