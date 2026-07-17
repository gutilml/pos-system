# Feature 007: Backend Shift & Cash Drawer Management

## Purpose

Adds backend shift lifecycle tracking for cash registers. A store can have one open shift, transactions are linked to the active shift, and closing a shift reconciles expected cash against the cashier's actual count.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/shifts/open` | Open a shift for a store with starting cash |
| `POST` | `/api/v1/shifts/{id}/events` | Add cash drawer pay-in/pay-out events |
| `POST` | `/api/v1/shifts/{id}/close` | Close shift and calculate discrepancy |

## Cash Math

All money uses `BigDecimal` scale 4 and `HALF_UP`.

```text
expected_cash = starting_cash + sum(transaction.grand_total) + pay_ins - pay_outs
discrepancy = actual_cash - expected_cash
```

Transactions with a `storeId` must have an active `OPEN` shift for that store. Transactions without a store remain supported for existing tests and non-store flows.

## Tests

```bash
cd backend
./mvnw test
```

Coverage includes:

- `ShiftServiceImplTest` for exact reconciliation math.
- `ShiftServiceIntegrationTest` for one-open-shift-per-store enforcement.
- `ShiftControllerTest` for shift lifecycle API contracts.
