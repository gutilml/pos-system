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
    exclude_from_global_discounts BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCT_CATEGORY (Junction Table for Multi-Category Margin Selection)
CREATE TABLE product_category (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 6. SHIFTS (Cash drawer sessions)
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES store_settings(id),
    status VARCHAR(20) NOT NULL, -- 'OPEN', 'CLOSED'
    starting_cash DECIMAL(12, 4) NOT NULL,
    expected_cash DECIMAL(12, 4),
    actual_cash DECIMAL(12, 4),
    discrepancy DECIMAL(12, 4),
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cash_drawer_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id),
    type VARCHAR(20) NOT NULL, -- 'PAY_IN', 'PAY_OUT'
    amount DECIMAL(12, 4) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. CUSTOMERS (Store tab / credit — gated by enable_customer_credit)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES store_settings(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    credit_limit DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    current_balance DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TRANSACTIONS (The Register Receipts)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES store_settings(id),
    shift_id UUID REFERENCES shifts(id),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- 'IN_PROGRESS', 'HELD', 'COMPLETED', 'VOIDED'
    subtotal DECIMAL(12, 4) NOT NULL,
    tax_total DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    grand_total DECIMAL(12, 4) NOT NULL,
    global_discount_percentage DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    total_discount_amount DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    amount_received DECIMAL(12, 4) NOT NULL,
    change_given DECIMAL(12, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TRANSACTION ITEMS (Line Items on the Receipt)
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- We store prices at the time of sale so historical receipts don't change if product prices are updated later
    quantity DECIMAL(10, 4) NOT NULL,
    price_at_time DECIMAL(12, 4) NOT NULL,
    original_unit_price DECIMAL(12, 4) NOT NULL,
    item_discount_percentage DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    final_unit_price DECIMAL(12, 4) NOT NULL,
    line_total DECIMAL(12, 4) NOT NULL
);

-- 10. TRANSACTION PAYMENTS (split tenders — one row per payment method on a receipt)
CREATE TABLE transaction_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'CARD', 'CREDIT'
    amount DECIMAL(12, 4) NOT NULL
);

-- 11. CREDIT LEDGER (audit trail for tab charges and payments)
CREATE TABLE credit_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(12, 4) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'CHARGE', 'PAYMENT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SYSTEM USERS (AuthN — separate from credit customers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN' | 'CASHIER'
    store_id UUID REFERENCES store_settings(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
