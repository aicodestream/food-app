-- Modify users table to support OTP-only login
-- Make username and password optional (nullable)

ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NULL;
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
