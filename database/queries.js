// Database Query Functions
const { pool } = require('./config');

// Get all menu items
async function getMenuItems() {
    const [rows] = await pool.query(
        'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, id'
    );
    return rows;
}

// Get menu items by category
async function getMenuItemsByCategory(category) {
    const [rows] = await pool.query(
        'SELECT * FROM menu_items WHERE category = ? AND is_available = TRUE',
        [category]
    );
    return rows;
}

// Create new order
async function createOrder(orderData) {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Insert order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, 
             total_amount, status, estimated_delivery) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                orderData.orderId,
                orderData.customerName,
                orderData.customerPhone,
                orderData.deliveryAddress,
                orderData.totalAmount,
                orderData.status || 'Pending',
                orderData.estimatedDelivery
            ]
        );
        
        // Insert order items
        for (const item of orderData.items) {
            await connection.query(
                `INSERT INTO order_items (order_id, item_name, quantity, price, total) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderData.orderId, item.name, item.quantity, item.price, item.total]
            );
        }
        
        await connection.commit();
        return { success: true, orderId: orderData.orderId };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Get all orders
async function getAllOrders() {
    const [orders] = await pool.query(
        `SELECT o.*, 
         GROUP_CONCAT(
             CONCAT(oi.quantity, 'x ', oi.item_name, ' - ₹', oi.total) 
             SEPARATOR '|'
         ) as items_list
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         GROUP BY o.id
         ORDER BY o.order_time DESC`
    );
    
    // Parse items list
    return orders.map(order => ({
        ...order,
        items: order.items_list ? order.items_list.split('|').map(item => {
            const match = item.match(/(\d+)x (.+) - ₹([\d.]+)/);
            return match ? {
                quantity: parseInt(match[1]),
                name: match[2],
                total: parseFloat(match[3])
            } : null;
        }).filter(Boolean) : []
    }));
}

// Get order by ID
async function getOrderById(orderId) {
    const [orders] = await pool.query(
        'SELECT * FROM orders WHERE order_id = ?',
        [orderId]
    );
    
    if (orders.length === 0) return null;
    
    const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
    );
    
    return {
        ...orders[0],
        items
    };
}

// Update order status
async function updateOrderStatus(orderId, status) {
    const [result] = await pool.query(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        [status, orderId]
    );
    return result.affectedRows > 0;
}

// Get orders by phone number
async function getOrdersByPhone(phone) {
    const [orders] = await pool.query(
        `SELECT o.*, 
         GROUP_CONCAT(
             CONCAT(oi.quantity, 'x ', oi.item_name) 
             SEPARATOR ', '
         ) as items_summary
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         WHERE o.customer_phone = ?
         GROUP BY o.id
         ORDER BY o.order_time DESC`,
        [phone]
    );
    return orders;
}

// Get daily statistics
async function getDailyStats(date) {
    const [stats] = await pool.query(
        `SELECT 
            DATE(order_time) as date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value,
            COUNT(DISTINCT customer_phone) as unique_customers
         FROM orders
         WHERE DATE(order_time) = ?
         GROUP BY DATE(order_time)`,
        [date]
    );
    return stats[0] || null;
}

// Get date range statistics
async function getDateRangeStats(startDate, endDate) {
    const [stats] = await pool.query(
        `SELECT 
            DATE(order_time) as date,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue
         FROM orders
         WHERE DATE(order_time) BETWEEN ? AND ?
         GROUP BY DATE(order_time)
         ORDER BY date DESC`,
        [startDate, endDate]
    );
    return stats;
}

// Get customer-wise billing
async function getCustomerBilling() {
    const [billing] = await pool.query(
        `SELECT 
            customer_name,
            customer_phone,
            COUNT(*) as total_orders,
            SUM(total_amount) as total_spent,
            AVG(total_amount) as avg_order_value,
            MAX(order_time) as last_order_date
         FROM orders
         GROUP BY customer_phone, customer_name
         ORDER BY total_spent DESC`
    );
    return billing;
}

module.exports = {
    getMenuItems,
    getMenuItemsByCategory,
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrdersByPhone,
    getDailyStats,
    getDateRangeStats,
    getCustomerBilling
};


// Visitor Tracking Functions

// Track a page visit
async function trackVisit(visitorId, pageUrl, userAgent, ipAddress) {
    try {
        // Insert page visit
        await pool.query(
            `INSERT INTO page_visits (visitor_id, page_url, user_agent, ip_address) 
             VALUES (?, ?, ?, ?)`,
            [visitorId, pageUrl, userAgent, ipAddress]
        );
        
        // Update daily stats - use CURDATE() for consistency
        // Get unique visitors count for today
        const [uniqueCount] = await pool.query(
            `SELECT COUNT(DISTINCT visitor_id) as count 
             FROM page_visits 
             WHERE DATE(visit_time) = CURDATE()`
        );
        
        // Get total page views for today
        const [viewsCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM page_visits 
             WHERE DATE(visit_time) = CURDATE()`
        );
        
        // Update or insert visitor stats
        await pool.query(
            `INSERT INTO visitor_stats (visit_date, page_views, unique_visitors) 
             VALUES (CURDATE(), ?, ?)
             ON DUPLICATE KEY UPDATE 
             page_views = ?, 
             unique_visitors = ?`,
            [viewsCount[0].count, uniqueCount[0].count, viewsCount[0].count, uniqueCount[0].count]
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error tracking visit:', error);
        return { success: false, error: error.message };
    }
}

// Get visitor statistics
async function getVisitorStats(days = 30) {
    const [stats] = await pool.query(
        `SELECT 
            visit_date,
            page_views,
            unique_visitors
         FROM visitor_stats
         WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ORDER BY visit_date DESC`,
        [days]
    );
    return stats;
}

// Get today's visitor stats
async function getTodayVisitorStats() {
    const [stats] = await pool.query(
        `SELECT 
            page_views,
            unique_visitors
         FROM visitor_stats
         WHERE visit_date = CURDATE()`
    );
    return stats[0] || { page_views: 0, unique_visitors: 0 };
}

// Get total visitors (all time)
async function getTotalVisitorStats() {
    const [stats] = await pool.query(
        `SELECT 
            SUM(page_views) as total_page_views,
            SUM(unique_visitors) as total_unique_visitors
         FROM visitor_stats`
    );
    return stats[0] || { total_page_views: 0, total_unique_visitors: 0 };
}

module.exports = {
    getMenuItems,
    getMenuItemsByCategory,
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrdersByPhone,
    getDailyStats,
    getDateRangeStats,
    getCustomerBilling,
    trackVisit,
    getVisitorStats,
    getTodayVisitorStats,
    getTotalVisitorStats
};
