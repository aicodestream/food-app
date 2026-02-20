// Cart state (in-memory)
let cart = [];

// API endpoint - Use serverless API
const API_ENDPOINT = 'https://api.aicodestreams.com/send-notification';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);
    
    renderMenu();
    setupEventListeners();
    setupScrollEffects();
    updateUserSection(); // Show user info if logged in
});

// Render menu items
// Render menu items
function renderMenu() {
    const lang = getCurrentLanguage();
    
    Object.keys(menuData).forEach(category => {
        const container = document.getElementById(category);
        if (container) {
            container.innerHTML = ''; // Clear existing items
            menuData[category].forEach(item => {
                const itemCard = createMenuCard(item, lang);
                container.appendChild(itemCard);
            });
        }
    });
}

// Create menu card
function createMenuCard(item, lang = 'en') {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    // Get name and description based on language
    const itemName = lang === 'mr' && item.nameMr ? item.nameMr : item.name;
    const itemDesc = lang === 'mr' && item.descriptionMr ? item.descriptionMr : item.description;
    
    // Check if image is emoji or file path
    const imageContent = item.image.includes('.') 
        ? `<img src="${item.image}" alt="${itemName}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">` 
        : `<div style="font-size: 4rem;">${item.image}</div>`;
    
    card.innerHTML = `
        <div class="item-image">${imageContent}</div>
        <h4>${itemName}</h4>
        <p>${itemDesc}</p>
        <p class="price">₹${item.price}</p>
        <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
    `;
    
    card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(item));
    return card;
}


// Add item to cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCart();
    showNotification(`${item.name} added to cart!`);
}

// Update cart display
function updateCart() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPrice.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => {
        // Check if image is a file path or emoji
        const imageDisplay = item.image.includes('.') 
            ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` 
            : `<span style="font-size: 2rem;">${item.image}</span>`;
        
        return `
            <div class="cart-item">
                <span class="item-emoji">${imageDisplay}</span>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} each</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <p class="item-total">₹${(item.price * item.quantity)}</p>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `;
    }).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = total.toFixed(2);
}

// Update quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Setup event listeners
function setupEventListeners() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeBtn = document.querySelector('.close');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            
            // Check if user is logged in
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.phone) {
                // User not logged in - redirect to simple login
                if (confirm('Please login to place an order. Redirect to login page?')) {
                    window.location.href = 'login-simple.html';
                }
                return;
            }
            
            // Pre-fill form with user data
            document.getElementById('customer-name').value = user.name || '';
            document.getElementById('customer-phone').value = user.phone.replace('+91', '') || '';
            
            updateOrderSummary();
            checkoutModal.style.display = 'block';
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
}

// Update order summary in checkout modal
function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');
    
    summaryItems.innerHTML = cart.map(item => `
        <p>${item.quantity}x ${item.name} - ₹${(item.price * item.quantity)}</p>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summaryTotal.textContent = total.toFixed(2);
}

// Handle checkout with enhanced error handling and retry logic
async function handleCheckout(e) {
    e.preventDefault();
    
    const customerPhone = document.getElementById('customer-phone').value;
    const customerName = document.getElementById('customer-name').value;
    
    // Store customer info for "My Orders" page
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.phone) {
        user.phone = customerPhone;
        user.name = user.name || customerName;
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    const orderData = {
        orderId: generateOrderId(),
        customerName: customerName,
        customerPhone: customerPhone,
        deliveryAddress: document.getElementById('delivery-address').value,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderTime: new Date().toISOString(),
        estimatedDelivery: '30 minutes',
        status: 'Pending'
    };
    
    console.log('🛒 CHECKOUT STARTED');
    console.log('📋 Order Data:', orderData);
    
    // Always save order first (before API call)
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('💾 Order saved to localStorage');
    
    // Format data for the API
    const apiPayload = {
        orderDetails: {
            orderId: orderData.orderId,
            customerName: orderData.customerName,
            items: orderData.items.map(item => `${item.quantity}x ${item.name} - ₹${item.total}`).join(', '),
            total: orderData.totalAmount,
            address: orderData.deliveryAddress
        },
        customerPhone: orderData.customerPhone
    };
    
    console.log('📡 API Payload:', apiPayload);
    console.log('🌐 API Endpoint:', API_ENDPOINT);
    
    // Try to send notification with retry logic
    let notificationSuccess = false;
    let notificationError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`📞 Notification attempt ${attempt}/3`);
            console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📊 Response status: ${response.status}`);
            console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📨 API Response:', result);
            
            if (result.success) {
                console.log('✅ Notification sent successfully!');
                notificationSuccess = true;
                break;
            } else {
                throw new Error(result.error || 'API returned success: false');
            }
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            notificationError = error;
            
            if (error.name === 'AbortError') {
                console.error('⏰ Request timed out');
            } else if (error.message.includes('Failed to fetch')) {
                console.error('🌐 Network error - check internet connection');
            } else {
                console.error('🔧 API error:', error);
            }
            
            // Wait before retry (except on last attempt)
            if (attempt < 3) {
                const delay = attempt * 2000; // 2s, 4s
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // Show confirmation regardless of notification status
    showConfirmation(orderData, notificationSuccess, notificationError);
    
    // Clear cart
    cart = [];
    updateCart();
    
    // Show appropriate notification
    if (notificationSuccess) {
        showNotification('Order placed successfully! Restaurant notified.');
    } else {
        showNotification('Order saved! Notification delivery pending.');
        console.warn('⚠️ All notification attempts failed. Order saved locally.');
    }
    
    console.log('🛒 CHECKOUT COMPLETED');
}

// Generate order ID
function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-8);
}

// Show confirmation modal with notification status
function showConfirmation(orderData, notificationSuccess = false, notificationError = null) {
    const checkoutModal = document.getElementById('checkout-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationDetails = document.getElementById('confirmation-details');
    
    checkoutModal.style.display = 'none';
    
    // Create notification status message
    let notificationStatus = '';
    if (notificationSuccess) {
        notificationStatus = `
            <p style="margin-top: 1rem; padding: 1rem; background: #d4edda; border-radius: 8px; color: #155724;">
                ✅ <strong>Restaurant and customer have been notified!</strong>
            </p>
        `;
    } else {
        notificationStatus = `
            <p style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; color: #856404;">
                ⚠️ <strong>Order saved successfully!</strong><br>
                Notification delivery is pending. Our restaurant owner will call you shortly.
            </p>
        `;
        if (notificationError) {
            notificationStatus += `
                <details style="margin-top: 0.5rem; font-size: 0.9em; color: #666;">
                    <summary>Technical details</summary>
                    <p style="margin: 0.5rem 0; font-family: monospace; background: #f8f9fa; padding: 0.5rem; border-radius: 4px;">
                        ${notificationError.message}
                    </p>
                </details>
            `;
        }
    }
    
    confirmationDetails.innerHTML = `
        <p><strong>Order ID:</strong> ${orderData.orderId}</p>
        <p><strong>Customer:</strong> ${orderData.customerName}</p>
        <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
        <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
        <div class="order-items">
            <h4>Items:</h4>
            ${orderData.items.map(item => `
                <p>${item.quantity}x ${item.name} - ₹${item.total}</p>
            `).join('')}
        </div>
        <p class="total-amount"><strong>Total: ₹${orderData.totalAmount}</strong></p>
        <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
        ${notificationStatus}
    `;
    
    confirmationModal.style.display = 'block';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup scroll effects
function setupScrollEffects() {
    // Scroll to top button
    const scrollBtn = document.createElement('div');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.menu-card, .category').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}


// Get translation helper
function getTranslation(key) {
    const lang = getCurrentLanguage();
    return translations[lang][key] || key;
}

// Update cart display with translations
function updateCartDisplay() {
    const lang = getCurrentLanguage();
    const t = translations[lang];
    
    if (cart.length === 0) {
        cartItems.innerHTML = `<p style="text-align: center; color: #999;">${t.emptyCart}<br>${t.startOrdering}</p>`;
        return;
    }
    
    // Re-render cart items with translated "Remove" button
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <h4>${item.name}</h4>
            <p>₹${item.price} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}</p>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">${t.remove}</button>
        </div>
    `).join('');
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

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.remove('active');
        }
    });
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

// Track visit on page load - call immediately
trackPageVisit();

// Also track when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    trackPageVisit();
});


// Update user section in navigation
function updateUserSection() {
    const userSection = document.getElementById('user-section');
    if (!userSection) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.phone) {
        // User is logged in
        const phone = user.phone.replace('+91', '').replace('91', '');
        userSection.innerHTML = `
            <div class="user-info">
                <span class="user-phone">📱 ${phone}</span>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        // User not logged in
        userSection.innerHTML = `
            <a href="login-simple.html" class="login-link">Login</a>
        `;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('userPhone');
        updateUserSection();
        showNotification('Logged out successfully');
        // Redirect to home
        window.location.href = 'index.html';
    }
}
