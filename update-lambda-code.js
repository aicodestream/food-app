const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS
AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.SharedIniFileCredentials({ profile: 'app' })
});

const lambda = new AWS.Lambda();

// Enhanced Lambda function code
const lambdaCode = `
const https = require('https');

exports.handler = async (event) => {
  const startTime = Date.now();
  const requestId = event.requestContext?.requestId || 'unknown';
  
  console.log(\`[\${requestId}] === REQUEST START ===\`);
  console.log(\`[\${requestId}] Event:\`, JSON.stringify(event, null, 2));
  
  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
      console.log(\`[\${requestId}] Parsed body:\`, JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error(\`[\${requestId}] Body parse error:\`, parseError.message);
      return createResponse(400, { success: false, error: 'Invalid JSON in request body' });
    }
    
    const { orderDetails, customerPhone } = body;
    
    if (!orderDetails || !customerPhone) {
      console.error(\`[\${requestId}] Missing required fields\`);
      return createResponse(400, { success: false, error: 'Missing orderDetails or customerPhone' });
    }
    
    const requiredFields = ['orderId', 'customerName', 'items', 'total', 'address'];
    const missingFields = requiredFields.filter(field => !orderDetails[field]);
    if (missingFields.length > 0) {
      console.error(\`[\${requestId}] Missing order fields:\`, missingFields);
      return createResponse(400, { success: false, error: \`Missing order fields: \${missingFields.join(', ')}\` });
    }
    
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
    const twilioSms = process.env.TWILIO_SMS_NUMBER;
    const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP_NUMBER;
    
    let formattedCustomerPhone = customerPhone;
    if (!customerPhone.startsWith('+')) {
      formattedCustomerPhone = '+91' + customerPhone.replace(/^91/, '');
    }
    console.log(\`[\${requestId}] Phone formatting: \${customerPhone} -> \${formattedCustomerPhone}\`);
    
    const restaurantMessage = \`🔔 NEW ORDER!

Order ID: \${orderDetails.orderId}
Customer: \${orderDetails.customerName}
Phone: \${formattedCustomerPhone}
Items: \${orderDetails.items}
Total: ₹\${orderDetails.total}
Address: \${orderDetails.address}

Please prepare this order!\`;
    
    const customerMessage = \`Thank you for your order! Order ID: \${orderDetails.orderId}. Total: ₹\${orderDetails.total}. We'll deliver in 30 minutes. - Shiv Tirth Wada\`;
    
    console.log(\`[\${requestId}] Messages prepared. Starting notifications...\`);
    
    const results = [];
    
    try {
      console.log(\`[\${requestId}] Sending WhatsApp to restaurant: \${restaurantWhatsApp}\`);
      const whatsappResult = await sendTwilioMessage(
        requestId,
        twilioAccountSid,
        twilioAuthToken,
        twilioWhatsApp,
        restaurantWhatsApp,
        restaurantMessage,
        'WhatsApp to Restaurant'
      );
      results.push({ type: 'restaurant_whatsapp', success: true, result: whatsappResult });
      console.log(\`[\${requestId}] ✅ Restaurant WhatsApp sent successfully\`);
    } catch (error) {
      console.error(\`[\${requestId}] ❌ Restaurant WhatsApp failed:\`, error.message);
      results.push({ type: 'restaurant_whatsapp', success: false, error: error.message });
    }
    
    try {
      console.log(\`[\${requestId}] Sending SMS to customer: \${formattedCustomerPhone}\`);
      const smsResult = await sendTwilioMessage(
        requestId,
        twilioAccountSid,
        twilioAuthToken,
        twilioSms,
        formattedCustomerPhone,
        customerMessage,
        'SMS to Customer'
      );
      results.push({ type: 'customer_sms', success: true, result: smsResult });
      console.log(\`[\${requestId}] ✅ Customer SMS sent successfully\`);
    } catch (error) {
      console.error(\`[\${requestId}] ❌ Customer SMS failed:\`, error.message);
      results.push({ type: 'customer_sms', success: false, error: error.message });
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalTime = Date.now() - startTime;
    
    console.log(\`[\${requestId}] === REQUEST COMPLETE ===\`);
    console.log(\`[\${requestId}] Success rate: \${successCount}/\${results.length}\`);
    console.log(\`[\${requestId}] Total time: \${totalTime}ms\`);
    
    if (successCount > 0) {
      return createResponse(200, { 
        success: true, 
        message: \`\${successCount}/\${results.length} notifications sent\`,
        results,
        processingTime: totalTime
      });
    } else {
      return createResponse(500, { 
        success: false, 
        error: 'All notifications failed',
        results,
        processingTime: totalTime
      });
    }
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(\`[\${requestId}] ❌ FATAL ERROR:\`, error);
    console.log(\`[\${requestId}] === REQUEST FAILED === (\${totalTime}ms)\`);
    
    return createResponse(500, { 
      success: false, 
      error: error.message,
      processingTime: totalTime
    });
  }
};

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function sendTwilioMessage(requestId, accountSid, authToken, from, to, body, messageType) {
  return new Promise((resolve, reject) => {
    console.log(\`[\${requestId}] \${messageType} - Starting Twilio request\`);
    
    const auth = Buffer.from(\`\${accountSid}:\${authToken}\`).toString('base64');
    const postData = new URLSearchParams({
      From: from,
      To: to,
      Body: body
    }).toString();
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: \`/2010-04-01/Accounts/\${accountSid}/Messages.json\`,
      method: 'POST',
      headers: {
        'Authorization': \`Basic \${auth}\`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      console.log(\`[\${requestId}] \${messageType} - Twilio response status: \${res.statusCode}\`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(\`[\${requestId}] \${messageType} - Twilio response:\`, data);
        
        try {
          const responseData = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log(\`[\${requestId}] \${messageType} - ✅ Success, Message SID: \${responseData.sid}\`);
            resolve(responseData);
          } else {
            console.error(\`[\${requestId}] \${messageType} - ❌ Twilio API error:\`, responseData);
            reject(new Error(\`Twilio API error (\${res.statusCode}): \${responseData.message || data}\`));
          }
        } catch (parseError) {
          console.error(\`[\${requestId}] \${messageType} - ❌ Response parse error:\`, parseError.message);
          reject(new Error(\`Invalid Twilio response: \${data}\`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(\`[\${requestId}] \${messageType} - ❌ Request error:\`, error.message);
      reject(error);
    });
    
    req.setTimeout(25000);
    req.write(postData);
    req.end();
  });
}
`;

async function updateLambdaFunction() {
    try {
        console.log('🔄 Updating Lambda function code...');
        
        const params = {
            FunctionName: 'food-ordering-notifications',
            ZipFile: Buffer.from(`
const JSZip = require('jszip');
const zip = new JSZip();
zip.file('index.js', lambdaCode);
const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            `)
        };
        
        // For inline code update, we need to use a different approach
        const updateParams = {
            FunctionName: 'food-ordering-notifications',
            Code: {
                ZipFile: Buffer.from(`exports.handler = ${lambdaCode}`)
            }
        };
        
        const result = await lambda.updateFunctionCode(updateParams).promise();
        console.log('✅ Lambda function updated successfully!');
        console.log('📋 Function ARN:', result.FunctionArn);
        
    } catch (error) {
        console.error('❌ Error updating Lambda function:', error.message);
        throw error;
    }
}

// Run the update
updateLambdaFunction().catch(console.error);