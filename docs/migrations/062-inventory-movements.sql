-- Feature 062: wholesale_margin + stock_movements
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS wholesale_margin DECIMAL(5, 4);

UPDATE products
SET wholesale_margin = ROUND(1 - (cost_price / wholesale_price), 4)
WHERE wholesale_margin IS NULL
  AND cost_price IS NOT NULL
  AND wholesale_price IS NOT NULL
  AND cost_price > 0
  AND wholesale_price > 0
  AND cost_price <= wholesale_price;

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES store_settings(id),
    product_id UUID NOT NULL REFERENCES products(id),
    type VARCHAR(20) NOT NULL,
    quantity_delta DECIMAL(12, 4) NOT NULL,
    quantity_after DECIMAL(12, 4) NOT NULL,
    unit_cost_before DECIMAL(12, 4),
    unit_cost_after DECIMAL(12, 4),
    selling_before DECIMAL(12, 4),
    selling_after DECIMAL(12, 4),
    wholesale_before DECIMAL(12, 4),
    wholesale_after DECIMAL(12, 4),
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON stock_movements (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_created ON stock_movements (store_id, created_at DESC);
