-- Feature 072: track returned qty on sale lines for partial/full reimburse
ALTER TABLE transaction_items
    ADD COLUMN IF NOT EXISTS returned_quantity DECIMAL(10, 4) NOT NULL DEFAULT 0.0000;

-- credit_ledger_entries.type may now include REFUND (no CHECK constraint to alter)
COMMENT ON COLUMN credit_ledger_entries.type IS
    'CHARGE | PAYMENT | REFUND';
