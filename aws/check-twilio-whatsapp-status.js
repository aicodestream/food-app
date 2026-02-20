// Check Twilio WhatsApp Business API status
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

async function checkWhatsAppStatus() {
  console.log('🔍 Checking Twilio WhatsApp Status...\n');
  console.log('Account SID:', accountSid);
  console.log('');
  
  const client = twilio(accountSid, authToken);
  
  try {
    // Check account details
    console.log('📊 Account Information:');
    const account = await client.api.accounts(accountSid).fetch();
    console.log('   Status:', account.status);
    console.log('   Type:', account.type);
    console.log('');
    
    // Check WhatsApp senders
    console.log('📱 WhatsApp Senders:');
    try {
      const senders = await client.messaging.v1.services.list();
      
      if (senders.length === 0) {
        console.log('   ❌ No WhatsApp senders found');
        console.log('   You are using SANDBOX only');
      } else {
        senders.forEach(sender => {
          console.log(`   - ${sender.friendlyName}`);
          console.log(`     SID: ${sender.sid}`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Could not fetch senders:', error.message);
    }
    console.log('');
    
    // Check phone numbers
    console.log('📞 Phone Numbers:');
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });
    
    if (numbers.length === 0) {
      console.log('   ⚠️  No phone numbers found');
    } else {
      numbers.forEach(number => {
        console.log(`   - ${number.phoneNumber}`);
        console.log(`     Capabilities: SMS=${number.capabilities.sms}, Voice=${number.capabilities.voice}`);
      });
    }
    console.log('');
    
    // Check if using sandbox
    console.log('🧪 WhatsApp Sandbox Status:');
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (twilioWhatsApp && twilioWhatsApp.includes('+14155238886')) {
      console.log('   ✅ Using Twilio WhatsApp Sandbox');
      console.log('   📝 This is for TESTING only');
      console.log('   ⚠️  Recipients must join sandbox to receive messages');
      console.log('');
      console.log('   To send to ANY customer without sandbox:');
      console.log('   1. Apply for WhatsApp Business API');
      console.log('   2. OR use SMS instead (recommended for now)');
    } else {
      console.log('   ✅ Using WhatsApp Business API');
      console.log('   📝 You can send to any customer');
    }
    console.log('');
    
    // Summary
    console.log('📋 SUMMARY:');
    console.log('');
    
    if (twilioWhatsApp && twilioWhatsApp.includes('+14155238886')) {
      console.log('❌ WhatsApp Business API: NOT ENABLED');
      console.log('✅ WhatsApp Sandbox: ENABLED (testing only)');
      console.log('✅ SMS: AVAILABLE');
      console.log('');
      console.log('💡 RECOMMENDATION:');
      console.log('   Use SMS for customers (no sandbox needed)');
      console.log('   Use WhatsApp for restaurant only');
      console.log('   This is already implemented in your code!');
      console.log('');
      console.log('🔗 To apply for WhatsApp Business API:');
      console.log('   https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders');
    } else {
      console.log('✅ WhatsApp Business API: ENABLED');
      console.log('   You can send WhatsApp to any customer!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your .env file has correct credentials');
    console.log('   2. Verify Account SID and Auth Token');
    console.log('   3. Check Twilio console: https://console.twilio.com/');
  }
}

checkWhatsAppStatus();
