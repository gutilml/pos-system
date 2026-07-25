# Feature 066 — Frontend inventory receive price preview

## Status

**Done** — Changing receive unit cost updates selling/wholesale from margins for review.

## Summary

On Inventory Receive, unit cost `onChange` derives selling (`targetMargin`) and wholesale (`wholesaleMargin`) via `sellingPriceFromMargin`. Cashiers can still override before save.

## Out of scope

* Backend blend changes (already **062**); adjust mode cost edits.
