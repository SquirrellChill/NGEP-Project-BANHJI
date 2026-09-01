-- ============================================================
-- BANHJI Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS kotchomnol;
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kotchomnol;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    phone_number    VARCHAR(20)     NOT NULL,
    email           VARCHAR(255)    NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_phone_number (phone_number),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sales: one row per sale transaction (the "receipt" header)
-- ------------------------------------------------------------
CREATE TABLE sales (
    sale_id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    sale_date       DATE            NOT NULL,
    total_amount    DECIMAL(12, 2)  NOT NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sales_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    KEY idx_sales_user_id (user_id),
    CONSTRAINT chk_sales_total_nonneg CHECK (total_amount >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sale_items: line items belonging to a sale
-- ------------------------------------------------------------
CREATE TABLE sale_items (
    sale_item_id    INT AUTO_INCREMENT PRIMARY KEY,
    sale_id         INT             NOT NULL,
    description     TEXT            NOT NULL,
    quantity        DECIMAL(10, 2)  NOT NULL,
    unit_price      DECIMAL(12, 2)  NOT NULL,
    amount          DECIMAL(12, 2)  NOT NULL,

    CONSTRAINT fk_sale_items_sale
        FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
        ON DELETE CASCADE,

    KEY idx_sale_items_sale_id (sale_id),
    CONSTRAINT chk_sale_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_sale_items_unit_price_nonneg CHECK (unit_price >= 0),
    CONSTRAINT chk_sale_items_amount_nonneg CHECK (amount >= 0)
) ENGINE=InnoDB;