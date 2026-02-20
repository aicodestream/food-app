// API endpoint
const API_URL = 'https://api.aicodestreams.com';

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMyOrders();
    
    // Auto-refresh orders every 30 seconds
    setInterval(loadMyOrders, 30000);
});

// Get customer phone from session/localStorage
function getCustomerPhone() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.phone) return null;
    
    // Normalize phone number - remove +91 prefix for matching
    let phone = user.phone.toString();
    phone = phone.replace(/^\+91/, '').replace(/^91/, '');
    return phone;
}

// Load customer's orders
async function loadMyOrders() {
    const phone = getCustomerPhone();
    
    if (!phone) {
        document.getElementById('orders-list').innerHTML = `
            <div class="no-orders">
                <h2>Please log in to view your orders</h2>
                <a href="login-otp.html" class="back-btn">Go to Login</a>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/customer/${phone}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        console.log('📦 Orders loaded:', orders.length);
        renderOrders(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = `
            <div class="no-orders">
                <h2>Unable to load orders</h2>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Render orders
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <h2>No orders yet</h2>
                <p>Start ordering delicious food!</p>
                <a href="index.html#menu" class="back-btn">Browse Menu</a>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => {
        const statusClass = order.status.toLowerCase().replace(/ /g, '-');
        const orderDate = new Date(order.orderTime || order.order_time).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">#${order.orderId || order.order_id}</div>
                        <small style="color: #999;">${orderDate}</small>
                    </div>
                    <span class="order-status status-${statusClass}">${order.status}</span>
                </div>
                
                <div class="order-details">
                    <p><strong>Delivery Address:</strong> ${order.deliveryAddress || order.delivery_address}</p>
                    ${(order.estimatedDelivery || order.estimated_delivery) ? `<p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || order.estimated_delivery}</p>` : ''}
                </div>
                
                <div class="order-items">
                    <h4>Order Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.quantity}x ${item.name || item.item_name}</span>
                            <span>₹${item.total}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    Total: ₹${order.totalAmount || order.total_amount}
                </div>
            </div>
        `;
    }).join('');
}


// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('nav-links');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && menuToggle) {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            navLinks.classList.remove('active');
        }
    }
});


// Visitor Tracking
function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
}

function trackPageVisit() {
    const visitorId = getOrCreateVisitorId();
    const pageUrl = window.location.pathname;
    
    fetch('https://api.aicodestreams.com/track-visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId, pageUrl })
    })
    .then(response => response.json())
    .then(data => console.log('Visit tracked:', data))
    .catch(error => console.log('Tracking error:', error));
}

// Track visit immediately
trackPageVisit();
