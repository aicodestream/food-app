// API endpoint
const API_URL = 'https://api.aicodestreams.com';
const API_BASE = API_URL; // Alias for compatibility

// In-memory orders (for testing without backend)
let orders = [];
let currentFilter = 'all'; // Track current filter

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadVisitorStatsCards();
    setInterval(loadOrders, 30000); // Auto-refresh every 30 seconds
    setInterval(loadVisitorStatsCards, 60000); // Refresh visitor stats every minute
});

// Load orders from backend or localStorage
async function loadOrders() {
    try {
        // Try to fetch from backend
        const response = await fetch(`${API_URL}/orders`);
        if (response.ok) {
            orders = await response.json();
        } else {
            // Fallback to localStorage
            orders = JSON.parse(localStorage.getItem('orders') || '[]');
        }
    } catch (error) {
        // Use localStorage if backend is not available
        orders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
    
    renderOrders();
    updateStats();
}

// Render orders
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    
    // Filter orders based on current filter
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(o => o.status === currentFilter);
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">#${order.order_id || order.orderId}</span>
                <span class="status ${order.status.toLowerCase().replace(/ /g, '-')}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customer_name || order.customerName}</p>
                <p><strong>Phone:</strong> ${order.customer_phone || order.customerPhone}</p>
                <p><strong>Address:</strong> ${order.delivery_address || order.deliveryAddress}</p>
                <p><strong>Order Time:</strong> ${new Date(order.order_time || order.orderTime).toLocaleString()}</p>
            </div>
            <div class="order-items">
                <strong>Items:</strong>
                ${order.items.map(item => `
                    <p>${item.quantity}x ${item.name || item.item_name} - ₹${item.total}</p>
                `).join('')}
                <p style="margin-top: 0.5rem;"><strong>Total: ₹${order.total_amount || order.totalAmount}</strong></p>
            </div>
            <div class="status-controls">
                ${order.status === 'Pending' ? `
                    <button class="status-btn preparing" onclick="updateStatus('${order.order_id || order.orderId}', 'Preparing')">Mark as Preparing</button>
                ` : ''}
                ${order.status === 'Preparing' ? `
                    <button class="status-btn delivering" onclick="updateStatus('${order.order_id || order.orderId}', 'Out for Delivery')">Mark as Delivering</button>
                ` : ''}
                ${order.status === 'Out for Delivery' ? `
                    <button class="status-btn completed" onclick="updateStatus('${order.order_id || order.orderId}', 'Delivered')">Mark as Delivered</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Filter orders by status
function filterOrders(status) {
    currentFilter = status;
    
    // Update title
    const title = document.getElementById('orders-title');
    if (status === 'all') {
        title.textContent = 'All Orders';
    } else {
        title.textContent = `${status} Orders`;
    }
    
    // Remove active class from all stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.remove('active-filter');
    });
    
    // Add active class to clicked card
    event.target.closest('.stat-card').classList.add('active-filter');
    
    renderOrders();
}

// Update order status
async function updateStatus(orderId, newStatus) {
    try {
        console.log(`Updating order ${orderId} to ${newStatus}...`);
        
        // Try to update via backend
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Status updated successfully in database');
            loadOrders(); // Reload from database
            return;
        } else {
            const error = await response.text();
            console.error('❌ API error:', error);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
    
    // Fallback to localStorage
    console.log('⚠️ Using localStorage fallback');
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        updateStats();
    }
}

// Update statistics
function updateStats() {
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('pending-orders').textContent = 
        orders.filter(o => o.status === 'Pending').length;
    document.getElementById('preparing-orders').textContent = 
        orders.filter(o => o.status === 'Preparing').length;
    document.getElementById('delivering-orders').textContent = 
        orders.filter(o => o.status === 'Out for Delivery').length;
    document.getElementById('completed-orders').textContent = 
        orders.filter(o => o.status === 'Delivered').length;
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activate button
    event.target.classList.add('active');
}

// Load today's statistics
async function loadDailyStats() {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const response = await fetch(`${API_URL}/stats/daily/${dateStr}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (!stats || stats.total_orders === 0) {
            resultsDiv.innerHTML = `
                <div class="analytics-card">
                    <h3>Today's Statistics (${dateStr})</h3>
                    <p style="text-align: center; color: #999; padding: 2rem;">No orders placed today yet</p>
                </div>
            `;
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="analytics-card">
                <h3>Today's Statistics (${dateStr})</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${stats.total_orders || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">₹${stats.total_revenue || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Order Value:</span>
                        <span class="stat-value">₹${stats.avg_order_value ? parseFloat(stats.avg_order_value).toFixed(2) : 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unique Customers:</span>
                        <span class="stat-value">${stats.unique_customers || 0}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading daily stats:', error);
        const resultsDiv = document.getElementById('analytics-results');
        resultsDiv.innerHTML = `<p style="text-align: center; color: #ff6b35; padding: 2rem;">Error: ${error.message}</p>`;
    }
}

// Load yesterday's statistics
async function loadYesterdayStats() {
    try {
        // Get yesterday's date in YYYY-MM-DD format
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const response = await fetch(`${API_URL}/stats/daily/${dateStr}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (!stats || stats.total_orders === 0) {
            resultsDiv.innerHTML = `
                <div class="analytics-card">
                    <h3>Yesterday's Statistics (${dateStr})</h3>
                    <p style="text-align: center; color: #999; padding: 2rem;">No orders placed yesterday</p>
                </div>
            `;
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="analytics-card">
                <h3>Yesterday's Statistics (${dateStr})</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${stats.total_orders || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">₹${stats.total_revenue || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Order Value:</span>
                        <span class="stat-value">₹${stats.avg_order_value ? parseFloat(stats.avg_order_value).toFixed(2) : 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unique Customers:</span>
                        <span class="stat-value">${stats.unique_customers || 0}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading daily stats:', error);
        const resultsDiv = document.getElementById('analytics-results');
        resultsDiv.innerHTML = `<p style="text-align: center; color: #ff6b35; padding: 2rem;">Error: ${error.message}</p>`;
    }
}

// Load date range statistics
async function loadRangeStats() {
    try {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (!startDate || !endDate) {
            resultsDiv.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">⚠️ Please select both start and end dates</p>';
            return;
        }
        
        resultsDiv.innerHTML = '<p class="placeholder-text">Loading statistics...</p>';
        
        const response = await fetch(`${API_URL}/stats/range?startDate=${startDate}&endDate=${endDate}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();
        
        if (!stats || stats.total_orders === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: #999;">No orders found in this date range</p>';
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="analytics-card">
                <h3>Date Range: ${startDate} to ${endDate}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${stats.total_orders || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">₹${stats.total_revenue || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Order Value:</span>
                        <span class="stat-value">₹${stats.avg_order_value ? parseFloat(stats.avg_order_value).toFixed(2) : 0}</span>
                    </div>
                </div>
                
                <h4 style="margin-top: 2rem;">Orders by Status</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Pending:</span>
                        <span class="stat-value">${stats.orders_by_status?.pending || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Preparing:</span>
                        <span class="stat-value">${stats.orders_by_status?.preparing || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Out for Delivery:</span>
                        <span class="stat-value">${stats.orders_by_status?.delivering || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Delivered:</span>
                        <span class="stat-value">${stats.orders_by_status?.delivered || 0}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading range stats:', error);
        const resultsDiv = document.getElementById('analytics-results');
        resultsDiv.innerHTML = `<p style="text-align: center; color: #ff6b35; padding: 2rem;">Error: ${error.message}</p>`;
    }
}

// Load customer billing
async function loadCustomerBilling() {
    try {
        const response = await fetch(`${API_URL}/stats/customers`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const customers = await response.json();
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (!customers || customers.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: #999;">No customer data available</p>';
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="analytics-card">
                <h3>Customer Billing Report</h3>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Avg Order</th>
                            <th>Last Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(customer => {
                            const avgOrder = customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0;
                            return `
                            <tr>
                                <td>${customer.name || 'N/A'}</td>
                                <td>${customer.phone || 'N/A'}</td>
                                <td>${customer.total_orders || 0}</td>
                                <td>₹${parseFloat(customer.total_spent || 0).toFixed(2)}</td>
                                <td>₹${avgOrder.toFixed(2)}</td>
                                <td>${customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading customer billing:', error);
        const resultsDiv = document.getElementById('analytics-results');
        resultsDiv.innerHTML = `<p style="text-align: center; color: #ff6b35; padding: 2rem;">Error: ${error.message}</p>`;
    }
}


// Load visitor statistics for dashboard cards
async function loadVisitorStatsCards() {
    try {
        // For now, set to 0 until visitor tracking endpoints are fully implemented
        document.getElementById('today-visitors').textContent = '0';
        document.getElementById('today-pageviews').textContent = '0';
        document.getElementById('total-visitors').textContent = '0';
        
        console.log('Visitor stats: Endpoints not yet implemented');
    } catch (error) {
        console.error('Error loading visitor stats:', error);
        document.getElementById('today-visitors').textContent = '0';
        document.getElementById('today-pageviews').textContent = '0';
        document.getElementById('total-visitors').textContent = '0';
    }
}


// Admin logout function
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Admin logging out...');
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
    }
}


// ==================== VISITOR ANALYTICS FUNCTIONS ====================

// Load visitor stats for a date range
async function loadVisitorStats() {
    const startDate = document.getElementById('visitor-start-date').value;
    const endDate = document.getElementById('visitor-end-date').value;
    
    const resultsDiv = document.getElementById('visitor-analytics-results');
    
    if (!startDate || !endDate) {
        resultsDiv.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">⚠️ Please select both start and end dates</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p class="placeholder-text">Loading visitor statistics...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/visitor-tracking?startDate=${startDate}&endDate=${endDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to load visitor stats');
        }
        
        const data = await response.json();
        displayVisitorStats(data, startDate, endDate);
    } catch (error) {
        console.error('Error loading visitor stats:', error);
        resultsDiv.innerHTML = `<p class="placeholder-text" style="color: #e74c3c;">Error loading visitor statistics. Please try again.</p>`;
    }
}

// Display visitor statistics
function displayVisitorStats(data, startDate, endDate) {
    const resultsDiv = document.getElementById('visitor-analytics-results');
    
    // Calculate totals
    const totalVisitors = data.visitors || 0;
    const totalPageViews = data.pageViews || 0;
    const avgPageViewsPerVisitor = totalVisitors > 0 ? (totalPageViews / totalVisitors).toFixed(2) : 0;
    const dateRange = `${formatDate(startDate)} to ${formatDate(endDate)}`;
    
    let html = `
        <div class="visitor-stats-grid">
            <div class="visitor-stat-card">
                <h4>👥 Total Visitors</h4>
                <div class="stat-value">${totalVisitors}</div>
                <div class="stat-label">${dateRange}</div>
            </div>
            <div class="visitor-stat-card">
                <h4>📄 Total Page Views</h4>
                <div class="stat-value">${totalPageViews}</div>
                <div class="stat-label">${dateRange}</div>
            </div>
            <div class="visitor-stat-card">
                <h4>📊 Avg Views/Visitor</h4>
                <div class="stat-value">${avgPageViewsPerVisitor}</div>
                <div class="stat-label">Pages per visitor</div>
            </div>
        </div>
    `;
    
    // Add daily breakdown if available
    if (data.dailyStats && data.dailyStats.length > 0) {
        html += `
            <h4 style="margin-top: 2rem; margin-bottom: 1rem; color: #333;">📅 Daily Breakdown</h4>
            <table class="visitor-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Visitors</th>
                        <th>Page Views</th>
                        <th>Avg Views/Visitor</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.dailyStats.forEach(day => {
            const avgViews = day.visitors > 0 ? (day.pageViews / day.visitors).toFixed(2) : 0;
            html += `
                <tr>
                    <td>${formatDate(day.date)}</td>
                    <td>${day.visitors}</td>
                    <td>${day.pageViews}</td>
                    <td>${avgViews}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    resultsDiv.innerHTML = html;
}

// Quick filter functions for visitor stats
function loadVisitorStatsToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visitor-start-date').value = today;
    document.getElementById('visitor-end-date').value = today;
    loadVisitorStats();
}

function loadVisitorStatsYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    document.getElementById('visitor-start-date').value = yesterdayStr;
    document.getElementById('visitor-end-date').value = yesterdayStr;
    loadVisitorStats();
}

function loadVisitorStatsWeek() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    document.getElementById('visitor-start-date').value = weekAgo.toISOString().split('T')[0];
    document.getElementById('visitor-end-date').value = today.toISOString().split('T')[0];
    loadVisitorStats();
}

function loadVisitorStatsMonth() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    document.getElementById('visitor-start-date').value = monthAgo.toISOString().split('T')[0];
    document.getElementById('visitor-end-date').value = today.toISOString().split('T')[0];
    loadVisitorStats();
}

// Update loadRangeStats to use new result div
async function loadRangeStats() {
    const startDate = document.getElementById('order-start-date').value;
    const endDate = document.getElementById('order-end-date').value;
    
    const resultsDiv = document.getElementById('order-analytics-results');
    
    if (!startDate || !endDate) {
        resultsDiv.innerHTML = '<p class="placeholder-text" style="color: #e74c3c;">⚠️ Please select both start and end dates</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p class="placeholder-text">Loading order statistics...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/stats/range?startDate=${startDate}&endDate=${endDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to load stats');
        }
        
        const data = await response.json();
        displayOrderStats(data, startDate, endDate);
    } catch (error) {
        console.error('Error loading range stats:', error);
        resultsDiv.innerHTML = `<p class="placeholder-text" style="color: #e74c3c;">Error loading order statistics. Please try again.</p>`;
    }
}

// Display order statistics
function displayOrderStats(data, startDate, endDate) {
    const resultsDiv = document.getElementById('order-analytics-results');
    const dateRange = `${formatDate(startDate)} to ${formatDate(endDate)}`;
    
    const html = `
        <div class="order-stats-summary">
            <h4>📦 Order Summary: ${dateRange}</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${data.total_orders || 0}</div>
                    <div class="summary-label">Total Orders</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">₹${(data.total_revenue || 0).toFixed(2)}</div>
                    <div class="summary-label">Total Revenue</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">₹${(data.average_order_value || 0).toFixed(2)}</div>
                    <div class="summary-label">Avg Order Value</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${data.unique_customers || 0}</div>
                    <div class="summary-label">Unique Customers</div>
                </div>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// Update loadCustomerBilling to use new result div
async function loadCustomerBilling() {
    const resultsDiv = document.getElementById('customer-billing-results');
    resultsDiv.innerHTML = '<p class="placeholder-text">Loading customer billing data...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/stats/customers`);
        
        if (!response.ok) {
            throw new Error('Failed to load customer billing');
        }
        
        const customers = await response.json();
        displayCustomerBilling(customers);
    } catch (error) {
        console.error('Error loading customer billing:', error);
        resultsDiv.innerHTML = `<p class="placeholder-text" style="color: #e74c3c;">Error loading customer billing data. Please try again.</p>`;
    }
}

// Display customer billing
function displayCustomerBilling(customers) {
    const resultsDiv = document.getElementById('customer-billing-results');
    
    if (!customers || customers.length === 0) {
        resultsDiv.innerHTML = '<p class="placeholder-text">No customer data available</p>';
        return;
    }
    
    let html = `
        <table class="billing-table">
            <thead>
                <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Avg Order Value</th>
                    <th>Last Order</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    customers.forEach(customer => {
        const avgOrderValue = customer.total_orders > 0 
            ? (customer.total_spent / customer.total_orders).toFixed(2) 
            : 0;
        const lastOrderDate = customer.last_order 
            ? new Date(customer.last_order).toLocaleDateString() 
            : 'N/A';
        
        html += `
            <tr>
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.phone}</td>
                <td>${customer.total_orders}</td>
                <td class="amount">₹${customer.total_spent.toFixed(2)}</td>
                <td>₹${avgOrderValue}</td>
                <td>${lastOrderDate}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    resultsDiv.innerHTML = html;
}

// Helper function to format dates
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Update loadDailyStats and loadYesterdayStats
function loadDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('order-start-date').value = today;
    document.getElementById('order-end-date').value = today;
    loadRangeStats();
}

function loadYesterdayStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    document.getElementById('order-start-date').value = yesterdayStr;
    document.getElementById('order-end-date').value = yesterdayStr;
    loadRangeStats();
}
