// Test SMS only
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function testSMS() {
  console.log('📱 Testing SMS...\n');
  
  try {
    const message = await client.messages.create({
      body: '🧪 SMS Test from QuickBite!\n\nIf you receive this, SMS is working! 🎉',
      from: '+18287981553',
      to: '+919766007557'
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('\n📱 Check your phone for SMS!');
    
  } catch (error) {
    console.log('❌ SMS Error:', error.message);
    console.log('Error Code:', error.code);
  }
}

testSMS();