// API endpoint
const API_URL = 'https://api.aicodestreams.com';

// In-memory orders (for testing without backend)
let orders = [];
let currentFilter = 'all'; // Track current filter

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadVisitorStats();
    setInterval(loadOrders, 30000); // Auto-refresh every 30 seconds
    setInterval(loadVisitorStats, 60000); // Refresh visitor stats every minute
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
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        const response = await fetch(`${API_URL}/stats/range?startDate=${startDate}&endDate=${endDate}`);
        const stats = await response.json();
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (stats.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: #999;">No orders found in this date range</p>';
            return;
        }
        
        const totalRevenue = stats.reduce((sum, day) => sum + parseFloat(day.total_revenue), 0);
        const totalOrders = stats.reduce((sum, day) => sum + day.total_orders, 0);
        
        resultsDiv.innerHTML = `
            <div class="analytics-card">
                <h3>Date Range: ${startDate} to ${endDate}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${totalOrders}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">₹${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average per Day:</span>
                        <span class="stat-value">₹${(totalRevenue / stats.length).toFixed(2)}</span>
                    </div>
                </div>
                
                <h4 style="margin-top: 2rem;">Daily Breakdown</h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(day => `
                            <tr>
                                <td>${day.date}</td>
                                <td>${day.total_orders}</td>
                                <td>₹${parseFloat(day.total_revenue).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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
        const customers = await response.json();
        
        const resultsDiv = document.getElementById('analytics-results');
        
        if (customers.length === 0) {
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
                        ${customers.map(customer => `
                            <tr>
                                <td>${customer.customer_name}</td>
                                <td>${customer.customer_phone}</td>
                                <td>${customer.total_orders}</td>
                                <td>₹${parseFloat(customer.total_spent).toFixed(2)}</td>
                                <td>₹${parseFloat(customer.avg_order_value).toFixed(2)}</td>
                                <td>${new Date(customer.last_order_date).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
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


// Load visitor statistics
async function loadVisitorStats() {
    try {
        // Get today's stats
        const todayResponse = await fetch(`${API_URL}/stats/visitors/today`);
        const todayStats = await todayResponse.json();
        
        // Get total stats
        const totalResponse = await fetch(`${API_URL}/stats/visitors/total`);
        const totalStats = await totalResponse.json();
        
        // Update UI
        document.getElementById('today-visitors').textContent = todayStats.unique_visitors || 0;
        document.getElementById('today-pageviews').textContent = todayStats.page_views || 0;
        document.getElementById('total-visitors').textContent = totalStats.total_unique_visitors || 0;
        
    } catch (error) {
        console.error('Error loading visitor stats:', error);
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
