-- Visitor Tracking Table
CREATE TABLE IF NOT EXISTS visitor_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_date DATE NOT NULL,
    page_views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (visit_date)
);

-- Page Visits Table (detailed tracking)
CREATE TABLE IF NOT EXISTS page_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    INDEX idx_visitor (visitor_id),
    INDEX idx_date (visit_time)
);

-- Insert initial data
INSERT INTO visitor_stats (visit_date, page_views, unique_visitors) 
VALUES (CURDATE(), 0, 0)
ON DUPLICATE KEY UPDATE visit_date = visit_date;
