-- ============================================================
-- Brings the database in line with app/models/.
-- The SQLAlchemy models were ahead of sql/schema.sql; this closes the gap.
-- Run once against an existing kotchomnol database. Back up first — this
-- drops a column.
-- ============================================================

USE kotchomnol;

-- ------------------------------------------------------------
-- sales: two totals instead of one.
-- A seller routinely quotes some products in riel and others in dollars
-- within the same sale. One column cannot hold both, and converting needs
-- an exchange rate that drifts, which would make stored history wrong.
-- ------------------------------------------------------------
ALTER TABLE sales
    ADD COLUMN total_khr DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER sale_date,
    ADD COLUMN total_usd DECIMAL(15, 2) NOT NULL DEFAULT 0 AFTER total_khr;

-- Existing rows: assume the old single total was riel.
UPDATE sales SET total_khr = total_amount WHERE total_khr = 0;

ALTER TABLE sales DROP CHECK chk_sales_total_nonneg;
ALTER TABLE sales DROP COLUMN total_amount;

ALTER TABLE sales
    ADD CONSTRAINT chk_sales_totals_nonneg
        CHECK (total_khr >= 0 AND total_usd >= 0),
    -- The summary query filters on both columns; one index covers all three
    -- periods since they differ only by date range.
    ADD KEY idx_sales_user_date (user_id, sale_date);

-- ------------------------------------------------------------
-- sale_items: each line carries its own currency.
-- ------------------------------------------------------------
ALTER TABLE sale_items
    ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'KHR' AFTER unit_price,
    ADD CONSTRAINT chk_sale_items_currency CHECK (currency IN ('KHR','USD'));
