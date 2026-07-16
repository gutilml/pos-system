# Feature 002: Backend Data Layer Foundation

## Purpose

Maps the PostgreSQL schema in `docs/database-schema.sql` to JPA entities and Spring Data repositories under `com.pos.core`. This is the persistence foundation for catalog, opt-in store settings, and transactions.

## Package layout

| Layer | Package |
| --- | --- |
| Entities | `com.pos.core.models` |
| Repositories | `com.pos.core.repositories` |

## Domain notes

- **Money & quantities** use `BigDecimal` with schema-aligned precision (`DECIMAL(12,4)`, `DECIMAL(10,4)`, `DECIMAL(5,4)`).
- **`StoreSettings.features`** is PostgreSQL `JSONB`, mapped via Hypersistence Utils (`JsonType`) as `Map<String, Boolean>` so feature flags can grow without DDL changes (opt-in architecture).
- **`Product` ↔ `Category`** is many-to-many through `product_category`.
- **`Product.parentProduct`** is a self-referencing many-to-one (`parent_product_id`).
- **`Transaction` → `TransactionItem`** is one-to-many with `CascadeType.ALL` and `orphanRemoval`.

## Highest category margin

`ProductRepository.findHighestTargetMarginByProductId(UUID)` returns `MAX(category.targetMargin)` for a product’s linked categories. Used later for margin-aware pricing logic.

## Tests

`@DataJpaTest` suites use **H2 in PostgreSQL compatibility mode** (Docker/Testcontainers was unavailable in the local environment; the feature plan allows this fallback).

- `ProductRepositoryTest` — margin query + `BigDecimal` round-trip precision
- `StoreSettingsRepositoryTest` — feature map save/load via Hypersistence `JsonType`

```bash
cd backend
./mvnw test
```

Against real PostgreSQL, apply `docs/database-schema.sql` and keep `spring.jpa.hibernate.ddl-auto=validate`. Hypersistence `JsonType` maps `StoreSettings.features` to JSONB on the PostgreSQL dialect.