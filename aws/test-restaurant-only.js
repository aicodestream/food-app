// Test restaurant notifications only
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function testRestaurant() {
  console.log('🧪 Testing restaurant notifications...\n');
  
  const testOrder = {
    orderId: 'TEST' + Date.now(),
    customerName: 'Test Customer',
    customerPhone: '+917028104413',
    items: [
      { name: 'Chicken Thali', quantity: 1, total: 349 },
      { name: 'Mutton Thali', quantity: 1, total: 449 }
    ],
    totalAmount: 798
  };
  
  const itemsList = testOrder.items.map(item => 
    `${item.quantity}x ${item.name} - ₹${item.total}`
  ).join('\n');
  
  // WhatsApp message
  const whatsappMsg = `🔔 NEW ORDER: ${testOrder.orderId}

Customer: ${testOrder.customerName}
Phone: ${testOrder.customerPhone}

Items:
${itemsList}

Total: ₹${testOrder.totalAmount}

Spice Kitchen`;
  
  // SMS message
  const smsMsg = `🔔 NEW ORDER: ${testOrder.orderId}
Customer: ${testOrder.customerName}
Phone: ${testOrder.customerPhone}
Total: ₹${testOrder.totalAmount}`;
  
  // Test WhatsApp
  console.log('📱 Testing WhatsApp to +919766007557...');
  try {
    const whatsapp = await client.messages.create({
      body: whatsappMsg,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919766007557'
    });
    console.log('✅ WhatsApp sent:', whatsapp.sid);
  } catch (error) {
    console.log('❌ WhatsApp failed:', error.message);
    if (error.message.includes('not a valid')) {
      console.log('\n💡 Your number needs to rejoin WhatsApp Sandbox');
      console.log('Send the join code to whatsapp:+14155238886');
    }
  }
  
  // Test SMS
  console.log('\n📱 Testing SMS to +919766007557...');
  try {
    const sms = await client.messages.create({
      body: smsMsg,
      from: '+18287981553',
      to: '+919766007557'
    });
    console.log('✅ SMS sent:', sms.sid);
  } catch (error) {
    console.log('❌ SMS failed:', error.message);
  }
}

testRestaurant();