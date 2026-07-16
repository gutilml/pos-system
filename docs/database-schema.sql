-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORE SETTINGS (The "Opt-In" Brain)
-- Uses JSONB so we can add new toggles in the future without altering the table schema.
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name VARCHAR(255) NOT NULL,
    features JSONB NOT NULL DEFAULT '{"enable_inventory": false, "enable_customer_credit": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    target_margin DECIMAL(5, 4) NOT NULL DEFAULT 0.0000, -- e.g., 0.3000 for 30%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS (The Core Catalog)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL, -- Barcode
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    cost_price DECIMAL(12, 4) DEFAULT 0.0000,
    selling_price DECIMAL(12, 4) NOT NULL,
    
    -- Inventory & Unit Rules
    track_inventory BOOLEAN DEFAULT false,
    current_stock DECIMAL(10, 4) DEFAULT 0.0000, -- Decimal to support fractional sales
    low_stock_threshold DECIMAL(10, 4) DEFAULT 0.0000,
    
    -- Bulk & Parent/Child Logic
    sell_by_weight BOOLEAN DEFAULT false,
    unit_of_measure VARCHAR(20), -- 'gr', 'ml', 'unit'
    is_individual_unit BOOLEAN DEFAULT false,
    parent_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    units_per_package DECIMAL(10, 4),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCT_CATEGORY (Junction Table for Multi-Category Margin Selection)
CREATE TABLE product_category (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 6. TRANSACTIONS (The Register Receipts)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES store_settings(id),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- 'IN_PROGRESS', 'HELD', 'COMPLETED', 'VOIDED'
    subtotal DECIMAL(12, 4) NOT NULL,
    tax_total DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    grand_total DECIMAL(12, 4) NOT NULL,
    amount_received DECIMAL(12, 4) NOT NULL,
    change_given DECIMAL(12, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TRANSACTION ITEMS (Line Items on the Receipt)
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- We store prices at the time of sale so historical receipts don't change if product prices are updated later
    quantity DECIMAL(10, 4) NOT NULL,
    price_at_time DECIMAL(12, 4) NOT NULL, 
    line_total DECIMAL(12, 4) NOT NULL
);