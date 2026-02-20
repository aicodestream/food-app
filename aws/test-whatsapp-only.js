// Test WhatsApp only
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function testWhatsApp() {
  console.log('💬 Testing WhatsApp...\n');
  
  try {
    const message = await client.messages.create({
      body: '🧪 WhatsApp Test from QuickBite!\n\nIf you receive this, WhatsApp is working! 🎉',
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919766007557'
    });
    
    console.log('✅ WhatsApp sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('\n📱 Check your WhatsApp!');
    
  } catch (error) {
    console.log('❌ WhatsApp Error:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.message.includes('not a valid phone number')) {
      console.log('\n💡 SOLUTION: Your number needs to join the WhatsApp Sandbox');
      console.log('1. Go to: https://console.twilio.com/');
      console.log('2. Navigate: Messaging → Try it out → Send a WhatsApp message');
      console.log('3. Send the join code to whatsapp:+14155238886');
    }
  }
}

testWhatsApp();