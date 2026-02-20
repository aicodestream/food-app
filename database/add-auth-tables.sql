-- Add authentication tables to existing database
USE food_ordering;

-- Users table with username/password
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_role (role)
);

-- Add user_id to orders table if not exists
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'food_ordering' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'user_id');

SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER id',
    'SELECT "Column already exists"');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Customer addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_line TEXT NOT NULL,
    landmark VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
