// Check available Twilio phone numbers
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function checkNumbers() {
  console.log('🔍 Checking your Twilio phone numbers...\n');
  
  try {
    // Get all phone numbers in your account
    const phoneNumbers = await client.incomingPhoneNumbers.list();
    
    if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers found in your account');
      console.log('\n💡 You need to buy a phone number for SMS:');
      console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search');
      console.log('2. Search for numbers in your country');
      console.log('3. Buy a number with SMS capability');
      console.log('4. Update TWILIO_SMS_NUMBER in .env file');
    } else {
      console.log('✅ Available phone numbers:');
      phoneNumbers.forEach((number, index) => {
        console.log(`${index + 1}. ${number.phoneNumber}`);
        console.log(`   SMS: ${number.capabilities.sms ? '✅' : '❌'}`);
        console.log(`   Voice: ${number.capabilities.voice ? '✅' : '❌'}`);
        console.log('');
      });
      
      // Find SMS-capable numbers
      const smsNumbers = phoneNumbers.filter(num => num.capabilities.sms);
      if (smsNumbers.length > 0) {
        console.log('📱 SMS-capable numbers:');
        smsNumbers.forEach(num => console.log(`   ${num.phoneNumber}`));
        console.log(`\n💡 Use one of these numbers as TWILIO_SMS_NUMBER in your .env file`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNumbers();