// Local testing script for Lambda function
require('dotenv').config();
const handler = require('./lambda/send-whatsapp').handler;

// Test event
const testEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    orderId: 'TEST123',
    customerName: 'Test Customer',
    customerPhone: '+919766007557', // Replace with your WhatsApp number
    deliveryAddress: '123 Test Street',
    items: [
      { name: 'Test Burger', quantity: 2, price: 10, total: 20 },
      { name: 'Test Fries', quantity: 1, price: 5, total: 5 }
    ],
    totalAmount: 25,
    estimatedDelivery: '30 minutes'
  })
};

// Run test
async function test() {
  console.log('Testing Lambda function locally...\n');
  console.log('Test Data:', JSON.parse(testEvent.body));
  console.log('\nSending WhatsApp...\n');
  
  try {
    const result = await handler(testEvent);
    console.log('Response Status:', result.statusCode);
    console.log('Response Body:', JSON.parse(result.body));
    
    if (result.statusCode === 200) {
      console.log('\n✅ SUCCESS! Check your WhatsApp for the message.');
    } else {
      console.log('\n❌ FAILED! Check the error above.');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

test();
