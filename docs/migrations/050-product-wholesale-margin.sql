-- Feature 050: product wholesale + target margin (run against live Postgres if ddl-auto=validate)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(12, 4) DEFAULT 0.0000;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS target_margin DECIMAL(5, 4);

COMMENT ON COLUMN products.wholesale_price IS 'Optional wholesale; 0 allowed';
COMMENT ON COLUMN products.target_margin IS 'Nullable product margin override; hierarchy product → category → store';
COMMENT ON COLUMN products.units_per_package IS 'Parent package qty only (Features 050/052); not set on children';
