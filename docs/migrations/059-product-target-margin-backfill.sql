-- Feature 059: backfill products.target_margin from cost and selling when missing
-- Formula matches ProductPricing.marginFromCostAndPrice: margin = 1 - (cost / selling)
UPDATE products
SET target_margin = ROUND(1 - (cost_price / selling_price), 4)
WHERE target_margin IS NULL
  AND cost_price IS NOT NULL
  AND selling_price IS NOT NULL
  AND cost_price > 0
  AND selling_price > 0
  AND cost_price <= selling_price;

COMMENT ON COLUMN products.target_margin IS
    'Nullable product margin override; hierarchy product → category → store. Backfilled from cost/selling when missing (Feature 059).';
