# Plan: Feature 003 - Backend Core API & Services

## Phase 1: Data Transfer Objects (DTOs)
Create DTOs in `src/main/java/com/pos/core/dtos/`:
* `ProductDTO`, `CategoryDTO`
* `TransactionRequestDTO` (Contains a list of `TransactionItemRequestDTO`)
* `TransactionResponseDTO`

## Phase 2: Service Layer
Create interfaces and implementations in `src/main/java/com/pos/core/services/`:
* `ProductService`: Handle CRUD operations and the margin-based price calculation logic.
* `TransactionService`: Handle the mathematical calculation of line items and saving the transaction state.

## Phase 3: REST Controllers
Create controllers in `src/main/java/com/pos/core/controllers/`:
* `ProductController`: `GET /api/v1/products`, `POST /api/v1/products`, etc.
* `TransactionController`: `POST /api/v1/transactions` (to process a new sale).

## Phase 4: Testing
* Write Unit tests for `TransactionService` to ensure exact `BigDecimal` math (e.g., preventing floating point errors on taxes).
* Write `@WebMvcTest` for controllers to verify JSON serialization and HTTP status codes (200 OK, 201 Created).