-- Feature 069: freeze ledger movement label in store UI locale at write time
ALTER TABLE credit_ledger_entries
    ADD COLUMN IF NOT EXISTS description VARCHAR(120);

UPDATE credit_ledger_entries
SET description = CASE
    WHEN type = 'PAYMENT' AND payment_method = 'CASH' THEN 'Payment · Cash'
    WHEN type = 'PAYMENT' AND payment_method = 'CARD' THEN 'Payment · Card'
    WHEN type = 'PAYMENT' THEN 'Payment'
    ELSE 'Charge'
END
WHERE description IS NULL;

ALTER TABLE credit_ledger_entries
    ALTER COLUMN description SET NOT NULL;
