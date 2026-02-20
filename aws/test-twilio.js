// Simple Twilio WhatsApp Test
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function testTwilio() {
  console.log('🧪 Testing Twilio WhatsApp...\n');
  
  // Check if credentials are loaded
  if (!accountSid || !authToken) {
    console.log('❌ Missing credentials in .env file');
    console.log('Make sure you have:');
    console.log('- TWILIO_ACCOUNT_SID');
    console.log('- TWILIO_AUTH_TOKEN');
    return;
  }
  
  console.log('✅ Credentials loaded');
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken.substring(0, 8) + '...');
  
  try {
    // Send a simple test message
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919766007557',
      body: '🧪 Test message from your food ordering system!\n\nIf you receive this, Twilio is working correctly! 🎉'
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('\n📱 Check your WhatsApp for the test message!');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    
    if (error.message.includes('not a valid phone number')) {
      console.log('\n💡 Solution: Make sure your WhatsApp number joined the Twilio Sandbox');
      console.log('Send "join <code>" to whatsapp:+14155238886');
    }
    
    if (error.message.includes('authenticate')) {
      console.log('\n💡 Solution: Check your Auth Token in .env file');
    }
  }
}

testTwilio();