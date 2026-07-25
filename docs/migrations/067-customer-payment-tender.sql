-- Feature 067: tender on customer balance payments (CASH/CARD)
ALTER TABLE credit_ledger_entries
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
