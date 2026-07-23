# Feature 027 — Backend Multi SKU / Barcode (1→N)

## Status

**Done**

## Behavior

* Child table `product_skus`: one product → many globally unique codes (or zero).
* Dropped `products.sku`; product identity stays `products.id`.
* Search: exact match on any active code → singleton; else name/code contains (max 25).
* Create accepts optional `skus[]` (empty = name-search-only).
* `PUT /api/v1/products/{id}/skus` replaces the full code list (hard-delete removed codes).
* `ProductDTO`: `skus`, `primarySku`, transitional `sku` alias of primary.

## Migration (existing Postgres)

No Flyway — apply manually before restarting the backend (`ddl-auto: validate`):

```sql
CREATE TABLE IF NOT EXISTS product_skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_skus (product_id, code, is_primary)
SELECT id, sku, true FROM products
WHERE sku IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM product_skus ps WHERE LOWER(ps.code) = LOWER(products.sku)
  );

DROP INDEX IF EXISTS products_sku_key; -- if named differently, drop the UNIQUE on products.sku
ALTER TABLE products DROP COLUMN IF EXISTS sku;

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_skus_code_ci ON product_skus (LOWER(code));
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON product_skus (product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_skus_one_primary ON product_skus (product_id) WHERE is_primary = true;
```

Then re-run `docs/seed-data.sql` (Cola has primary `7501000000028` + secondary `7501000001025`).

## Follow-up

Feature 028 — register consumes the new DTO.

## Out of scope

Pack/parent-child scan routing; retired/inactive codes; code audit history; full product update/deactivate API; SKU admin UI.
