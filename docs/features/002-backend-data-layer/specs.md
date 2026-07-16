# Specification: Feature 002 - Backend Data Layer Foundation

## Objective
Establish the core relational database mappings in the Java/Spring Boot backend to support the POS system's modular architecture. This establishes the foundation for products, categories, transactions, and the flexible "opt-in" store settings.

## Scope
* **Strictly Backend:** No frontend (React/Vite) code is to be touched.
* **Domain Models:** Define the JPA Entities mapping to the PostgreSQL schema defined in `docs/database-schema.sql`.
* **Data Access:** Create Spring Data JPA repositories for all domain models.

## Business Rules & Technical Constraints
* **Financial & Fractional Precision:** All monetary values (e.g., `cost_price`, `selling_price`) and fractional inventory weights/quantities (e.g., `current_stock`, `units_per_package`) MUST use `java.math.BigDecimal`. 
* **Database Mapping:** Map `BigDecimal` to `DECIMAL(12, 4)` precision. Do not use `float` or `double`.
* **Extensibility:** The `StoreSettings` entity must utilize PostgreSQL `JSONB` to store the feature toggle configurations, allowing future modules (like inventory or credit) to be enabled without altering the table structure.
* **Associations:** Implement a Many-to-Many relationship between `Product` and `Category`. Implement a One-to-Many cascade relationship between `Transaction` and `TransactionItem`.

## Acceptance Criteria
1. Application context loads successfully with the configured entities.
2. All entity mappings correctly align with the PostgreSQL schema.
3. `@DataJpaTest` suites pass, verifying UUID generation, `BigDecimal` precision, and database constraints.