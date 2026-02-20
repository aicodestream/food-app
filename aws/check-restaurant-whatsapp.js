// Check restaurant WhatsApp message status
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function checkRestaurantWhatsApp() {
    console.log('🔍 Checking restaurant WhatsApp message...\n');
    
    // Latest message SID from logs
    const messageSid = 'SMea315592041a215d96c0674e69e1ae91';
    
    try {
        const message = await client.messages(messageSid).fetch();
        
        console.log('📱 Message Details:');
        console.log('   To:', message.to);
        console.log('   From:', message.from);
        console.log('   Status:', message.status);
        console.log('   Error Code:', message.errorCode || 'None');
        console.log('   Error Message:', message.errorMessage || 'None');
        console.log('   Date Sent:', message.dateSent);
        console.log('');
        
        if (message.status === 'delivered') {
            console.log('✅ Message delivered successfully!');
            console.log('   Restaurant should have received WhatsApp on +919766007557');
        } else if (message.status === 'sent') {
            console.log('📤 Message sent, waiting for delivery...');
        } else if (message.status === 'failed' || message.status === 'undelivered') {
            console.log('❌ Message failed!');
            console.log('   Reason:', message.errorMessage || 'Unknown');
            
            if (message.errorCode === 63016) {
                console.log('\n⚠️  ISSUE: Restaurant number has not joined Twilio WhatsApp Sandbox');
                console.log('   Solution:');
                console.log('   1. Open WhatsApp on +919766007557');
                console.log('   2. Send message to: +14155238886');
                console.log('   3. Message text: join <your-sandbox-keyword>');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkRestaurantWhatsApp();
