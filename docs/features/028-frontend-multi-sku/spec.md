# Feature: Frontend Multi SKU / Barcode Consumption

## Description

Adapt the register catalog client and cart display to the Feature 027 product shape: multiple (or zero) SKU/barcode codes per product, with cart lines showing the primary code when present. Scanning any linked code continues to add the correct product via the existing search API.

## User Stories

* As a cashier, I want scanning any barcode linked to a product to add that product so alternate supplier codes work at the register.
* As a cashier, I want the cart to show the primary SKU when one exists so the line is identifiable; name-only products still show clearly without a code.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 027.
* **Out of scope:** Product/SKU admin UI (no catalog admin screen yet; use `PUT …/skus` later); offline catalog; changing checkout `productId` payload.

## UX & Business Rules

* `ProductApi` / `toCartProduct`: consume `skus`, `primarySku`, and transitional `sku`.
* Cart line `sku`: use `primarySku ?? sku ?? ''` (empty string when name-only); `CartItemRow` already shows `{sku} · price` — empty sku should not look broken (omit code segment or show name-only).
* `SearchBar`: unchanged flow (backend returns exact-code singleton); still adds first result.
* Tests: dual-code mapping, null primary, search still adds product.

## Acceptance Criteria

1. [ ] `frontend/src/api/products.ts` types match Feature 027 DTO (`skus`, `primarySku`, nullable `sku`).
2. [ ] `toCartProduct` maps primary code into cart `sku` (empty when none).
3. [ ] Cart UI remains usable for name-only products (no bogus placeholder SKU required).
4. [ ] Vitest covers mapping + SearchBar still adding a product when API returns multi-code DTO.
5. [ ] Pending frontend multi-SKU item marked done / noted; feature README + `docs/README.md` updated.
