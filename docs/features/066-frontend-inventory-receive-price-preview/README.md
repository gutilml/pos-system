# Feature 066 — Frontend inventory receive price preview

## Status

**Done** — Changing receive unit cost updates selling/wholesale from margins for review (**lot** prices). **Feature [094](../094-frontend-inventory-receive-blend-preview/README.md)** adds the post-blend product price preview after receive.

## Summary

On Inventory Receive, unit cost `onChange` derives selling (`targetMargin`) and wholesale (`wholesaleMargin`) via `sellingPriceFromMargin`. Cashiers can still override before save.

## Out of scope

* Backend blend changes (already **062**); adjust mode cost edits; post-blend product preview (**094**).
