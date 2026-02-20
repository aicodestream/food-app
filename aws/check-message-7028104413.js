// Check the status of messages sent to 7028104413
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function checkMessageStatus() {
  console.log('🔍 Checking WhatsApp message status for 7028104413...\n');
  
  const messageSids = [
    'SM47127ae10ae0ffe9ca843dcfed5010ad', // Order 1
    'SM8ac8159913e9d6885cea6a38e7edc0f6'  // Order 2
  ];
  
  for (const sid of messageSids) {
    try {
      const message = await client.messages(sid).fetch();
      
      console.log(`📱 Message: ${sid}`);
      console.log(`   To: ${message.to}`);
      console.log(`   Status: ${message.status}`);
      console.log(`   Error Code: ${message.errorCode || 'None'}`);
      console.log(`   Error Message: ${message.errorMessage || 'None'}`);
      console.log(`   Date Sent: ${message.dateSent}`);
      console.log('');
      
      if (message.status === 'failed' || message.status === 'undelivered') {
        console.log('❌ ISSUE FOUND:');
        if (message.errorCode === 63016) {
          console.log('   The number has NOT joined the Twilio WhatsApp Sandbox!');
          console.log('   Solution: Send "join <sandbox-keyword>" to +14155238886');
        } else {
          console.log(`   Error: ${message.errorMessage}`);
        }
        console.log('');
      } else if (message.status === 'delivered') {
        console.log('✅ Message delivered successfully!');
        console.log('');
      } else if (message.status === 'sent') {
        console.log('📤 Message sent, waiting for delivery confirmation...');
        console.log('');
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${sid}:`, error.message);
    }
  }
  
  console.log('\n📋 Status Meanings:');
  console.log('   queued: Message is waiting to be sent');
  console.log('   sent: Message sent to WhatsApp');
  console.log('   delivered: Message delivered to recipient');
  console.log('   failed/undelivered: Message could not be delivered');
  console.log('');
  console.log('🔧 If status is "failed" with error 63016:');
  console.log('   The number +917028104413 needs to join Twilio WhatsApp Sandbox');
  console.log('   1. Open WhatsApp on that phone');
  console.log('   2. Send message to: +14155238886');
  console.log('   3. Message text: join <your-sandbox-keyword>');
  console.log('   4. Wait for confirmation message');
}

checkMessageStatus();
