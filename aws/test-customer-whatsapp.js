// Test script to verify customer WhatsApp notifications
require('dotenv').config();
const { handler } = require('./lambda/send-whatsapp');

async function testCustomerWhatsApp() {
  console.log('🧪 Testing Customer WhatsApp Notification...\n');
  
  // Test order data
  const testOrder = {
    orderId: 'TEST-' + Date.now(),
    customerName: 'Test Customer',
    customerPhone: '+919766007557', // Your number
    deliveryAddress: 'Test Address, Pune',
    items: [
      { name: 'Chicken Thali', quantity: 1, total: 150 },
      { name: 'Jira Rice', quantity: 1, total: 80 }
    ],
    totalAmount: 230,
    estimatedDelivery: '30-40 minutes'
  };
  
  console.log('📦 Test Order Details:');
  console.log('Order ID:', testOrder.orderId);
  console.log('Customer:', testOrder.customerName);
  console.log('Phone:', testOrder.customerPhone);
  console.log('Total:', '₹' + testOrder.totalAmount);
  console.log('\n📱 Sending WhatsApp notifications...\n');
  
  // Create Lambda event
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(testOrder)
  };
  
  try {
    const result = await handler(event);
    const response = JSON.parse(result.body);
    
    console.log('✅ Status:', result.statusCode);
    console.log('\n📊 Results:');
    console.log('Customer WhatsApp SID:', response.customerMessageSid || '❌ Failed');
    console.log('Restaurant Notifications:', response.restaurantNotifications?.length || 0);
    
    if (response.restaurantNotifications) {
      response.restaurantNotifications.forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.sid}`);
      });
    }
    
    if (response.customerMessageSid) {
      console.log('\n✅ SUCCESS! Customer should receive WhatsApp on +919766007557');
    } else {
      console.log('\n⚠️  Customer WhatsApp failed - check if number joined Twilio sandbox');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Check WhatsApp on +919766007557 (customer)');
    console.log('2. Check WhatsApp on +918668909382 (restaurant)');
    console.log('3. Both should have received order confirmation');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify Twilio credentials in .env file');
    console.log('2. Ensure both numbers joined Twilio WhatsApp Sandbox');
    console.log('3. Send "join <keyword>" to +14155238886 from both numbers');
  }
}

testCustomerWhatsApp();
