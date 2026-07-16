# Feature 003: Backend Core API & Services

## Purpose

Exposes the core product catalog and checkout APIs. Services own all money math; controllers only accept/return DTOs (never JPA entities).

## Package layout

| Layer | Package |
| --- | --- |
| DTOs | `com.pos.core.dtos` |
| Services | `com.pos.core.services` |
| Controllers | `com.pos.core.controllers` |
| Errors | `com.pos.core.exception` |

## Endpoints

| Method | Path | Status |
| --- | --- | --- |
| `GET` | `/api/v1/products` | 200 |
| `GET` | `/api/v1/products/{id}` | 200 / 404 |
| `POST` | `/api/v1/products` | 201 |
| `POST` | `/api/v1/transactions` | 201 |

## Business rules

- **Margin pricing:** If `sellingPrice` is omitted on create but `costPrice` + `categoryId` are present:
  `sellingPrice = costPrice / (1 - targetMargin)` (scale 4, `HALF_UP`).
- **Checkout math:** Server recalculates `subtotal`, `taxTotal`, `grandTotal`, and `changeGiven` from catalog prices. Client totals are ignored. Line `priceAtTime` is snapshotted from `product.sellingPrice`.
- **Tax:** Optional `taxRate` on the transaction request (fraction, e.g. `0.0825`). Defaults to `0`.
- **Opt-in modules:** No inventory deduction or customer credit checks in this feature.

## Tests

```bash
cd backend
./mvnw test
```

- `ProductServiceImplTest` / `TransactionServiceImplTest` — unit math
- `ProductControllerTest` / `TransactionControllerTest` — `@WebMvcTest` HTTP/JSON
