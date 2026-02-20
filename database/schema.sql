-- Food Ordering Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS food_ordering;
USE food_ordering;

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('appetizers', 'main-courses', 'desserts', 'beverages') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    estimated_delivery VARCHAR(50),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Insert sample menu items
INSERT INTO menu_items (name, category, price, description, image) VALUES
-- Appetizers
('Paneer Tikka', 'appetizers', 249.00, 'Grilled cottage cheese with spices', '🧀'),
('Samosa (2 pcs)', 'appetizers', 49.00, 'Crispy pastry with potato filling', '🥟'),
('Chicken 65', 'appetizers', 299.00, 'Spicy fried chicken appetizer', '🍗'),

-- Main Courses
('Chicken Thali', 'main-courses', 349.00, 'Complete meal with chicken curry, rice, roti, dal, and sides', 'images/chicken-thali.jfif'),
('Mutton Thali', 'main-courses', 449.00, 'Complete meal with mutton curry, rice, roti, dal, and sides', 'images/mutton-thalli.jfif'),
('Veg Thali', 'main-courses', 249.00, 'Complete vegetarian meal with curry, rice, roti, dal, and sides', '🍛'),
('Chicken Biryani', 'main-courses', 299.00, 'Aromatic basmati rice with spiced chicken', '🍚'),
('Jeera Rice', 'main-courses', 149.00, 'Cumin flavored basmati rice', 'images/jira-rice.jfif'),
('Butter Chicken', 'main-courses', 329.00, 'Creamy tomato-based chicken curry', '🍛'),
('Dal Makhani', 'main-courses', 199.00, 'Creamy black lentils with butter', '🍲'),

-- Desserts
('Gulab Jamun (3 pcs)', 'desserts', 99.00, 'Sweet milk dumplings in sugar syrup', '🍡'),
('Rasgulla (3 pcs)', 'desserts', 99.00, 'Soft cottage cheese balls in syrup', '🍡'),
('Kulfi', 'desserts', 79.00, 'Traditional Indian ice cream', '🍨'),

-- Beverages
('Sweet Lassi', 'beverages', 79.00, 'Chilled yogurt drink', '🥛'),
('Masala Chai', 'beverages', 39.00, 'Spiced Indian tea', '☕'),
('Fresh Lime Soda', 'beverages', 49.00, 'Refreshing lime drink', '🍋');

-- Create indexes for better performance
CREATE INDEX idx_order_id ON orders(order_id);
CREATE INDEX idx_customer_phone ON orders(customer_phone);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_time ON orders(order_time);
