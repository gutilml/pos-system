# Feature 019 — Backend Customer Search API

## Status

**Planned** (Phase A). Unblocks Feature 014 `CustomerSearch` / Feature 020.

## Intended contract

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/customers/search?storeId={uuid}&q={text}` | 200 + `CustomerDTO[]` (max ~20); blank `q` → `[]` |

Module: `com.pos.customers`.
