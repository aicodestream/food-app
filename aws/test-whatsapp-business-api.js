// Test WhatsApp Business API with approved sender
require('dotenv').config();
const { handler } = require('./lambda/send-whatsapp');

async function testWhatsAppBusinessAPI() {
  console.log('🧪 Testing WhatsApp Business API...\n');
  console.log('✅ Using approved WhatsApp sender: +918668909382');
  console.log('✅ Can send to ANY customer (no sandbox needed!)\n');
  
  // Test order data with customer number 7028104413
  const testOrder = {
    orderId: 'TEST-BUSINESS-API-' + Date.now(),
    customerName: 'Hemya',
    customerPhone: '7028104413', // Customer who didn't receive before
    deliveryAddress: 'Miraj, Maharashtra',
    items: [
      { name: 'Chicken Thali', quantity: 1, total: 349 },
      { name: 'Jeera Rice', quantity: 1, total: 149 }
    ],
    totalAmount: 498,
    estimatedDelivery: '30-40 minutes'
  };
  
  console.log('📦 Test Order:');
  console.log('Order ID:', testOrder.orderId);
  console.log('Customer:', testOrder.customerName);
  console.log('Phone:', testOrder.customerPhone);
  console.log('Total: ₹' + testOrder.totalAmount);
  console.log('\n📱 Sending WhatsApp via Business API...\n');
  
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
    console.log('Customer Message SID:', response.customerMessageSid || '❌ Failed');
    console.log('Notification Type:', response.customerNotificationType);
    console.log('Restaurant Notifications:', response.restaurantNotifications?.length || 0);
    
    if (response.customerMessageSid) {
      console.log('\n✅ SUCCESS!');
      console.log('   Customer (7028104413) should receive WhatsApp');
      console.log('   Using WhatsApp Business API (no sandbox needed!)');
      console.log('   Check WhatsApp on that phone now!');
    } else {
      console.log('\n⚠️  Customer WhatsApp failed');
      console.log('   Check error logs above');
    }
    
    console.log('\n📝 What happened:');
    console.log('1. Used approved WhatsApp sender: +918668909382');
    console.log('2. Sent to customer: +917028104413');
    console.log('3. Used WhatsApp message template (approved by Meta)');
    console.log('4. No sandbox join required!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify .env has TWILIO_WHATSAPP_NUMBER=whatsapp:+918668909382');
    console.log('2. Check template SID is correct');
    console.log('3. Verify WhatsApp Business API is active in Twilio console');
  }
}

testWhatsAppBusinessAPI();
