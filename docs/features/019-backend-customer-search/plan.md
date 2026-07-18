# Plan: Feature 019 - Backend Customer Search API

## Backend Architecture

### Repository — `CustomerRepository`
Add a Spring Data query, e.g.:

* `List<Customer> findByStore_IdAndNameContainingIgnoreCaseOr…` — prefer a single `@Query` with `store.id = :storeId` and `(LOWER(name) LIKE … OR phone LIKE …)` and `Pageable` / `LIMIT`.

### Service — `CustomerCreditService` / `CustomerCreditServiceImpl`
* Add `List<CustomerDTO> searchCustomers(UUID storeId, String query)`.
* Trim query; if blank return empty list.
* Map entities with existing DTO mapping used by create/pay endpoints.

### Controller — `CustomerController`
* `GET /search` **before** `/{id}/…` path patterns is already fine (search is static segment).
* `@GetMapping("/search")` with `@RequestParam UUID storeId`, `@RequestParam String q`.

### DTO
Reuse `CustomerDTO` (id, storeId, name, phone, creditLimit, currentBalance, createdAt) — matches frontend `CustomerSearchResult`.

## Frontend Architecture

None (backend-only). Feature 020 wires `storeId` on the client.

## Additional Considerations

* Indexing: name/phone search may be fine unindexed for small stores; note follow-up if catalogs grow.
* Do not gate this read behind `enable_customer_credit` unless existing create APIs already do so consistently — prefer matching Feature 012 controller style (document if gated).
* Update `docs/pending feature/backend.md` Customer search item when shipped.
