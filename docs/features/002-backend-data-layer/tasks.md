# Tasks: Feature 002 - Backend Data Layer Foundation

- [x] 1. Add Hypersistence Utils (or equivalent dependency) to `pom.xml`/`build.gradle` to support PostgreSQL JSONB mapping.
- [x] 2. Create `StoreSettings` and `Category` JPA entities.
- [x] 3. Create `Product` JPA entity, mapping the Many-to-Many relationship with `Category` and the self-referencing parent ID.
- [x] 4. Create `Transaction` and `TransactionItem` JPA entities with cascade rules.
- [x] 5. Create Spring Data JPA Repositories for all 5 entities.
- [x] 6. Add custom `@Query` to `ProductRepository` or `CategoryRepository` to find the highest `targetMargin` for a given `productId`.
- [x] 7. Write `@DataJpaTest` for `ProductRepository` verifying the highest margin query and `BigDecimal` precision.
- [x] 8. Write `@DataJpaTest` for `StoreSettingsRepository` verifying JSONB saving/retrieving.
