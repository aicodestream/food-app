// Check message status from Twilio
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Message SID from the logs
const messageSid = 'SM2b24361a91181e2d3af01036381bf861';

async function checkStatus() {
  console.log('🔍 Checking message status...\n');
  
  try {
    const message = await client.messages(messageSid).fetch();
    
    console.log('Message Details:');
    console.log('To:', message.to);
    console.log('From:', message.from);
    console.log('Status:', message.status);
    console.log('Error Code:', message.errorCode);
    console.log('Error Message:', message.errorMessage);
    console.log('Date Sent:', message.dateSent);
    
    if (message.errorCode) {
      console.log('\n❌ Message Failed!');
      console.log('Reason:', message.errorMessage);
      
      if (message.errorCode === 63016) {
        console.log('\n💡 Solution: Phone number needs to join WhatsApp Sandbox');
        console.log('Send "join <code>" to whatsapp:+14155238886');
      }
    } else if (message.status === 'delivered') {
      console.log('\n✅ Message was delivered successfully!');
    } else {
      console.log('\n⏳ Message status:', message.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStatus();