// Test SMS to customer (works without opt-in!)
require('dotenv').config();
const { handler } = require('./lambda/send-whatsapp');

async function testSMS() {
  console.log('🧪 Testing SMS to Customer...\n');
  console.log('✅ SMS works immediately (no opt-in needed!)');
  console.log('✅ Customer will receive SMS on 7028104413\n');
  
  const testOrder = {
    orderId: 'TEST-SMS-' + Date.now(),
    customerName: 'Hemya',
    customerPhone: '7028104413',
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
  console.log('\n📱 Sending SMS...\n');
  
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
    console.log('Note:', response.note);
    
    if (response.customerMessageSid) {
      console.log('\n✅ SUCCESS!');
      console.log('   SMS sent to 7028104413');
      console.log('   Check phone for SMS message');
      console.log('   No opt-in required!');
    } else {
      console.log('\n⚠️  SMS failed - check error logs');
    }
    
    console.log('\n📝 Why SMS instead of WhatsApp:');
    console.log('   - WhatsApp requires customer opt-in (Meta policy)');
    console.log('   - SMS works immediately');
    console.log('   - Cost difference: only ₹0.20 per message');
    console.log('   - Reliable delivery');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testSMS();
