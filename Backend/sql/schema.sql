-- ============================================================
-- BANHJI Database Schema
-- MySQL 8.0+
-- One file, no migrations needed — this is the full final structure.
-- Drop and recreate the database before running this if you're
-- switching over from an older schema version.
-- ============================================================

CREATE DATABASE IF NOT EXISTS kotchomnol
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kotchomnol;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100)    NULL,   -- unknown until profile completed (Telegram signup)
    last_name       VARCHAR(100)    NULL,
    phone_number    VARCHAR(20)     NOT NULL,
    email           VARCHAR(255)    NULL,
    password_hash   VARCHAR(255)    NULL,   -- NULL for Telegram-only accounts

    -- email verification
    is_verified                     BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verification_code         VARCHAR(255)    NULL,  -- sha256 hash of the code, never store plaintext
    email_verification_expires      DATETIME        NULL,
    email_verification_attempts     INT             NOT NULL DEFAULT 0,
    email_verification_locked_until DATETIME        NULL,

    -- password reset
    password_reset_token            VARCHAR(255)    NULL,  -- sha256 hash of the token
    password_reset_expires          DATETIME        NULL,

    -- OTP (e.g. login/verification via SMS or Telegram)
    otp_hash             VARCHAR(64)   NULL,
    otp_expires_at        DATETIME      NULL,
    otp_attempts          INT           NOT NULL DEFAULT 0,
    otp_last_sent_at      DATETIME      NULL,

    -- Telegram login
    telegram_id         BIGINT          NULL,
    telegram_username   VARCHAR(255)    NULL,

    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_phone_number (phone_number),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_telegram_id (telegram_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sales: one row per sale transaction (the "receipt" header)
--
-- Riel and dollars are tracked as two separate totals rather than
-- one column. A seller routinely quotes some products in riel and
-- others in dollars within the same sale; converting between them
-- needs an exchange rate that drifts, which would make stored
-- history wrong the moment it moves. They're never added together.
-- ------------------------------------------------------------
CREATE TABLE sales (
    sale_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    sale_date       DATE            NOT NULL,
    total_khr       DECIMAL(15, 2)  NOT NULL DEFAULT 0,
    total_usd       DECIMAL(15, 2)  NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sales_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_sales_totals_nonneg
        CHECK (total_khr >= 0 AND total_usd >= 0),

    -- Covers lookups by user, and the summary query which filters
    -- by user + date range for daily/weekly/monthly periods alike.
    KEY idx_sales_user_date (user_id, sale_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sale_items: line items belonging to a sale
-- Each line carries its own currency, since a single sale can mix
-- riel-priced and dollar-priced items.
-- ------------------------------------------------------------
CREATE TABLE sale_items (
    sale_item_id    INT AUTO_INCREMENT PRIMARY KEY,
    sale_id         INT             NOT NULL,
    description     TEXT            NOT NULL,
    quantity        DECIMAL(10, 2)  NOT NULL,
    unit_price      DECIMAL(12, 2)  NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'KHR',
    amount          DECIMAL(12, 2)  NOT NULL,

    CONSTRAINT fk_sale_items_sale
        FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
        ON DELETE CASCADE,

    KEY idx_sale_items_sale_id (sale_id),
    CONSTRAINT chk_sale_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_sale_items_unit_price_nonneg CHECK (unit_price >= 0),
    CONSTRAINT chk_sale_items_amount_nonneg CHECK (amount >= 0),
    CONSTRAINT chk_sale_items_currency CHECK (currency IN ('KHR','USD'))
) ENGINE=InnoDB;