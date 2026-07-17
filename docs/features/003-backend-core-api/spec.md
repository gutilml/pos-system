# Specification: Feature 003 - Backend Core API & Services

## Objective
Implement the business logic (Services) and REST API endpoints (Controllers) for managing the product catalog and processing checkout transactions. 

## Scope
* **Strictly Backend:** No frontend code.
* **DTO Pattern:** Do not expose raw JPA entities to the web layer. Use Records or DTO classes for all requests and responses to prevent over-posting and infinite recursion.
* **Core Only:** Focus strictly on standard checkout. Do not implement inventory deduction or customer credit checks yet (those are separate opt-in modules).

## Business Rules
* **Transaction Math:** The `TransactionService` must recalculate the `subtotal`, `tax_total`, and `grand_total` using `BigDecimal` on the backend. Do not trust totals sent by the frontend.
* **Pricing Fallback:** When creating a product via API, if `sellingPrice` is null but `costPrice` and `categoryId` are provided, the service must calculate the `sellingPrice` using the category's `targetMargin`.
* **API Versioning:** Base all routes on `/api/v1/`.