// Local server to test end-to-end flow with MySQL
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import the Lambda handler
const { handler } = require('./lambda/send-whatsapp');

// Import database functions
const { testConnection } = require('../database/config');
const { createOrder, getAllOrders, getMenuItems, updateOrderStatus, getDailyStats, getDateRangeStats, getCustomerBilling, trackVisit, getVisitorStats, getTodayVisitorStats, getTotalVisitorStats } = require('../database/queries');
const { registerUser, loginUser, getUserById } = require('../database/auth-queries');
const { sendOTP, verifyOTPAndLogin } = require('../database/otp-queries');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the main website
app.use(express.static(path.join(__dirname, '..')));

// API endpoint to get menu from database
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await getMenuItems();
    
    // Group by category
    const menu = {
      appetizers: [],
      'main-courses': [],
      desserts: [],
      beverages: []
    };
    
    menuItems.forEach(item => {
      menu[item.category].push(item);
    });
    
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// API endpoint to get orders by customer phone
app.get('/api/orders/customer/:phone', async (req, res) => {
  try {
    let { phone } = req.params;
    const orders = await getAllOrders();
    
    // Normalize phone number for matching
    phone = phone.replace(/^\+91/, '').replace(/^91/, '');
    
    // Filter orders for this customer - match with or without country code
    const customerOrders = orders.filter(order => {
      let orderPhone = (order.customer_phone || order.customerPhone || '').toString();
      orderPhone = orderPhone.replace(/^\+91/, '').replace(/^91/, '');
      return orderPhone === phone;
    });
    
    console.log(`📋 Found ${customerOrders.length} orders for phone: ${phone}`);
    res.json(customerOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// API endpoint to get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// API endpoint for user registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body;
    
    if (!username || !password || !name || !phone) {
      return res.status(400).json({ error: 'Username, password, name, and phone are required' });
    }
    
    const user = await registerUser({ username, password, name, phone, email });
    
    console.log(`✅ New user registered: ${username}`);
    res.json({ 
      success: true, 
      user,
      message: 'Registration successful' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API endpoint for user login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const result = await loginUser(username, password);
    
    if (result.success) {
      console.log(`✅ User logged in: ${username} (${result.user.role})`);
      res.json(result);
    } else {
      res.status(401).json(result);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// API endpoint to send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const result = await sendOTP(phone);
    console.log(`✅ OTP sent to: ${phone}`);
    res.json(result);
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// API endpoint to verify OTP and login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    
    const result = await verifyOTPAndLogin(phone, otp);
    
    if (result.success) {
      console.log(`✅ User logged in via OTP: ${phone}`);
      res.json(result);
    } else {
      res.status(401).json(result);
    }
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// API endpoint to update order status
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updated = await updateOrderStatus(orderId, status);
    
    if (updated) {
      console.log(`✅ Order ${orderId} status updated to: ${status}`);
      res.json({ success: true, message: 'Status updated' });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
    
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// API endpoint for daily statistics
app.get('/api/stats/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const stats = await getDailyStats(date);
    res.json(stats || { date, total_orders: 0, total_revenue: 0 });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// API endpoint for date range statistics
app.get('/api/stats/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await getDateRangeStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// API endpoint for customer billing
app.get('/api/stats/customers', async (req, res) => {
  try {
    const billing = await getCustomerBilling();
    res.json(billing);
  } catch (error) {
    console.error('Billing error:', error);
    res.status(500).json({ error: 'Failed to fetch customer billing' });
  }
});

// API endpoint to track visitor
app.post('/api/track-visit', async (req, res) => {
  try {
    const { visitorId, pageUrl } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    await trackVisit(visitorId, pageUrl, userAgent, ipAddress);
    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// API endpoint to get visitor statistics
app.get('/api/stats/visitors', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const stats = await getVisitorStats(days);
    res.json(stats);
  } catch (error) {
    console.error('Visitor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics' });
  }
});

// API endpoint to get today's visitor stats
app.get('/api/stats/visitors/today', async (req, res) => {
  try {
    const stats = await getTodayVisitorStats();
    res.json(stats);
  } catch (error) {
    console.error('Today visitor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch today visitor statistics' });
  }
});

// API endpoint to get total visitor stats
app.get('/api/stats/visitors/total', async (req, res) => {
  try {
    const stats = await getTotalVisitorStats();
    res.json(stats);
  } catch (error) {
    console.error('Total visitor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch total visitor statistics' });
  }
});

// API endpoint that mimics AWS Lambda and saves to MySQL
app.post('/api/send-whatsapp', async (req, res) => {
  console.log('\n🔔 New order received!');
  console.log('Order data:', req.body);
  
  try {
    // Save order to MySQL database
    const dbResult = await createOrder(req.body);
    console.log('✅ Order saved to database:', dbResult.orderId);
    
    // Create Lambda-like event object for WhatsApp/SMS
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(req.body)
    };
    
    // Call the Lambda handler to send notifications
    const result = await handler(event);
    
    // Parse the response
    const response = JSON.parse(result.body);
    
    console.log('\n📱 Notification Results:');
    console.log('Status:', result.statusCode);
    console.log('Customer SMS:', response.customerMessageSid);
    if (response.restaurantNotifications) {
      response.restaurantNotifications.forEach(notif => {
        console.log(`Restaurant ${notif.type.toUpperCase()}:`, notif.sid);
      });
    }
    
    // Send response back to frontend
    res.status(result.statusCode).json({
      ...response,
      savedToDatabase: true
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Local test server running on http://localhost:${PORT}`);
  console.log(`📱 Food ordering website: http://localhost:${PORT}/index.html`);
  console.log(`👨‍💼 Admin panel: http://localhost:${PORT}/admin.html`);
  
  // Test database connection
  console.log('\n🔍 Testing database connection...');
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    console.log('\n✅ MySQL database connected!');
    console.log('🧪 Ready for end-to-end testing with database!');
    console.log('1. Open the website');
    console.log('2. Place an order');
    console.log('3. Order will be saved to MySQL');
    console.log('4. Check your phone for notifications');
  } else {
    console.log('\n⚠️  Database connection failed - orders will not be saved');
  }
});