-- Feature 079: shift opener/closer + transaction creator audit stamps (Option A)
-- Nullable for legacy rows; FKs to users(id).

ALTER TABLE shifts
    ADD COLUMN IF NOT EXISTS opened_by UUID REFERENCES users(id);

ALTER TABLE shifts
    ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES users(id);

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

COMMENT ON COLUMN shifts.opened_by IS 'User who opened the shift (JWT at open); null for legacy';
COMMENT ON COLUMN shifts.closed_by IS 'User who closed the shift (JWT at close); null for legacy / still OPEN';
COMMENT ON COLUMN transactions.created_by IS 'User who created the sale (JWT at create); null for legacy';
