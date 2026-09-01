-- Run this against your existing 'kotchomnol' (or 'banhji') database
-- to add the columns needed for email verification and password reset,
-- without dropping your existing users table or data.

ALTER TABLE users
    ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER password_hash,
    ADD COLUMN email_verification_code VARCHAR(255) NULL AFTER is_verified,
    ADD COLUMN email_verification_expires DATETIME NULL AFTER email_verification_code,
    ADD COLUMN email_verification_attempts INT NOT NULL DEFAULT 0 AFTER email_verification_expires,
    ADD COLUMN email_verification_locked_until DATETIME NULL AFTER email_verification_attempts,
    ADD COLUMN password_reset_token VARCHAR(255) NULL AFTER email_verification_locked_until,
    ADD COLUMN password_reset_expires DATETIME NULL AFTER password_reset_token;