# Plan: Feature 002 - Backend Data Layer Foundation

## Phase 1: Entity Creation
Create the domain models in `src/main/java/com/pos/core/models/`.
* `StoreSettings.java` (Implement custom Hibernate types or Hypersistence Utils for JSONB mapping).
* `Category.java` (Include `targetMargin` as `BigDecimal`).
* `Product.java` (Include pricing, unit logic, and self-referencing `parentProduct` relationship).
* `Transaction.java` (Include status enum, totals).
* `TransactionItem.java` (Include historical pricing and quantity).

## Phase 2: Repository Creation
Create the Spring Data interfaces in `src/main/java/com/pos/core/repositories/`.
* `StoreSettingsRepository.java`
* `CategoryRepository.java`
* `ProductRepository.java` (Include a custom query to fetch the highest category margin for a specific product).
* `TransactionRepository.java`
* `TransactionItemRepository.java`

## Phase 3: Testing Strategy
Create integration tests in `src/test/java/com/pos/core/repositories/`.
* Use `@DataJpaTest`.
* Use Testcontainers for PostgreSQL (preferred) or H2 with PostgreSQL compatibility mode if Testcontainers is not yet configured.
* Verify precision saving and retrieval (e.g., saving `1.0333` and ensuring it retrieves exactly as `1.0333`).
* Verify the highest margin custom query works across the Many-to-Many category mapping.