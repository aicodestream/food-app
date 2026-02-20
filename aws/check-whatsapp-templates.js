// Check available WhatsApp message templates
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

async function checkTemplates() {
  console.log('🔍 Checking WhatsApp Message Templates...\n');
  
  const client = twilio(accountSid, authToken);
  
  try {
    // Check content templates
    const templates = await client.content.v1.contents.list({ limit: 50 });
    
    if (templates.length === 0) {
      console.log('❌ No WhatsApp templates found\n');
      console.log('📝 You need to create message templates to use WhatsApp Business API\n');
      console.log('How to create templates:');
      console.log('1. Go to: https://console.twilio.com/us1/develop/sms/content-editor');
      console.log('2. Click "Create new Content"');
      console.log('3. Choose "WhatsApp" as channel');
      console.log('4. Create template for order confirmation');
      console.log('5. Submit for approval (usually approved in minutes)\n');
      console.log('Template example:');
      console.log('---');
      console.log('Name: order_confirmation');
      console.log('Language: English');
      console.log('Category: TRANSACTIONAL');
      console.log('Body: Your order {{1}} has been confirmed! Total: Rs.{{2}}. Delivery in {{3}}. Thank you!');
      console.log('---\n');
    } else {
      console.log(`✅ Found ${templates.length} template(s):\n`);
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.friendlyName}`);
        console.log(`   SID: ${template.sid}`);
        console.log(`   Types: ${template.types ? Object.keys(template.types).join(', ') : 'N/A'}`);
        console.log(`   Language: ${template.language || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('📋 Next Steps:');
    if (templates.length === 0) {
      console.log('1. Create WhatsApp message templates in Twilio console');
      console.log('2. Wait for approval (usually quick for transactional messages)');
      console.log('3. Update code to use approved templates');
    } else {
      console.log('✅ You have templates! You can send WhatsApp to ANY customer now!');
      console.log('   No sandbox needed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: WhatsApp Business API uses "Content Templates"');
    console.log('   Check: https://console.twilio.com/us1/develop/sms/content-editor');
  }
}

checkTemplates();
