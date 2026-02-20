// Check the status of the specific message we just sent
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function checkMessage() {
  console.log('🔍 Checking message status...\n');
  
  // The message SID from the test
  const messageSid = 'MM54b6e4d272ce0b5fb87e90c6f6cbc29e';
  
  try {
    const message = await client.messages(messageSid).fetch();
    
    console.log('📱 Message Details:');
    console.log('   SID:', message.sid);
    console.log('   To:', message.to);
    console.log('   From:', message.from);
    console.log('   Status:', message.status);
    console.log('   Direction:', message.direction);
    console.log('   Date Created:', message.dateCreated);
    console.log('   Date Sent:', message.dateSent);
    console.log('   Date Updated:', message.dateUpdated);
    console.log('   Error Code:', message.errorCode || 'None');
    console.log('   Error Message:', message.errorMessage || 'None');
    console.log('   Price:', message.price || 'N/A');
    console.log('   Price Unit:', message.priceUnit || 'N/A');
    console.log('');
    
    // Explain the status
    console.log('📊 Status Explanation:');
    switch(message.status) {
      case 'queued':
        console.log('   ⏳ Message is queued and waiting to be sent');
        break;
      case 'sending':
        console.log('   📤 Message is being sent');
        break;
      case 'sent':
        console.log('   ✅ Message was sent to WhatsApp');
        console.log('   ⏳ Waiting for delivery confirmation');
        break;
      case 'delivered':
        console.log('   ✅ Message was delivered to recipient!');
        console.log('   📱 Customer should have received it');
        break;
      case 'read':
        console.log('   ✅✅ Message was delivered AND read by customer!');
        break;
      case 'failed':
        console.log('   ❌ Message failed to send');
        console.log('   Error:', message.errorMessage);
        break;
      case 'undelivered':
        console.log('   ❌ Message could not be delivered');
        console.log('   Error:', message.errorMessage);
        break;
      default:
        console.log('   Status:', message.status);
    }
    console.log('');
    
    // Check for common issues
    if (message.errorCode) {
      console.log('❌ ERROR FOUND:');
      console.log('   Code:', message.errorCode);
      console.log('   Message:', message.errorMessage);
      console.log('');
      
      // Common error codes
      if (message.errorCode === 63016) {
        console.log('   Issue: Recipient not in WhatsApp sandbox');
        console.log('   Solution: Use WhatsApp Business API (which we are trying)');
      } else if (message.errorCode === 63007) {
        console.log('   Issue: Template not found or not approved');
        console.log('   Solution: Check template SID and approval status');
      } else if (message.errorCode === 21211) {
        console.log('   Issue: Invalid phone number');
        console.log('   Solution: Check phone number format');
      }
    }
    
    // Check if it's actually a WhatsApp message
    if (!message.to.startsWith('whatsapp:')) {
      console.log('⚠️  WARNING: This is not a WhatsApp message!');
      console.log('   To number should start with "whatsapp:"');
      console.log('   Current:', message.to);
    }
    
  } catch (error) {
    console.error('❌ Error fetching message:', error.message);
  }
}

checkMessage();
