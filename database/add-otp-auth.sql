-- Add OTP authentication table
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    INDEX idx_phone (phone),
    INDEX idx_expires (expires_at)
);

-- Add phone index to users table if not exists (check first)
-- ALTER TABLE users ADD INDEX idx_phone (phone);

-- Clean up expired OTPs (optional, can be run periodically)
-- DELETE FROM otp_codes WHERE expires_at < NOW() OR is_used = TRUE;
