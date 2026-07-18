# Feature 019 — Backend Customer Search API

## Status

**Done** — Phase A. Unblocks Feature 020.

## Contract

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/customers/search?storeId={uuid}&q={text}` | **200** + `CustomerDTO[]` (max 20) |
| | | Blank/whitespace `q` → `[]` |
| | | Missing `storeId` → **400** |
| | | Store missing → **404**; credit disabled → **400** business rule |

Search is case-insensitive partial match on `name` or `phone`, scoped to `storeId`. Gated by `enable_customer_credit` (same as Feature 012 writes).

## Architecture

- `CustomerRepository.searchByStoreAndQuery`
- `CustomerCreditService.searchCustomers`
- `CustomerController` `GET /search` (before `/{id}/…`)
