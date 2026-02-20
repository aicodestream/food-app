const https = require('https');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  const body = JSON.parse(event.body || '{}');
  const { orderDetails, customerPhone } = body;
  
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
  const twilioSms = process.env.TWILIO_SMS_NUMBER;
  const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP_NUMBER;
  
  // Format customer phone number - add +91 if not present
  let formattedCustomerPhone = customerPhone;
  if (!customerPhone.startsWith('+')) {
    formattedCustomerPhone = '+91' + customerPhone;
  }
  
  // Format message
  const message = `🔔 NEW ORDER!

Order ID: ${orderDetails.orderId}
Customer: ${orderDetails.customerName}
Phone: ${formattedCustomerPhone}
Items: ${orderDetails.items}
Total: ₹${orderDetails.total}
Address: ${orderDetails.address}

Please prepare this order!`;
  
  try {
    // Send WhatsApp to restaurant
    await sendTwilioMessage(
      twilioAccountSid,
      twilioAuthToken,
      twilioWhatsApp,
      restaurantWhatsApp,
      message
    );
    
    // Send SMS to customer with proper formatting
    const customerMessage = `Thank you for your order! Order ID: ${orderDetails.orderId}. Total: ₹${orderDetails.total}. We'll deliver in 30 minutes. - Shiv Tirth Wada`;
    await sendTwilioMessage(
      twilioAccountSid,
      twilioAuthToken,
      twilioSms,
      formattedCustomerPhone,
      customerMessage
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify({ success: true, message: 'Notifications sent' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

function sendTwilioMessage(accountSid, authToken, from, to, body) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const postData = new URLSearchParams({
      From: from,
      To: to,
      Body: body
    }).toString();
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Twilio response (${res.statusCode}):`, data);
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Twilio error: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}