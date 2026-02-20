const https = require('https');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const startTime = Date.now();
  const requestId = event.requestContext?.requestId || 'unknown';
  
  console.log(`[${requestId}] === REQUEST START ===`);
  console.log(`[${requestId}] Event:`, JSON.stringify(event, null, 2));
  
  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
      console.log(`[${requestId}] Parsed body:`, JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error(`[${requestId}] Body parse error:`, parseError.message);
      return createResponse(400, { success: false, error: 'Invalid JSON in request body' });
    }
    
    const { orderDetails, customerPhone } = body;
    
    if (!orderDetails || !customerPhone) {
      console.error(`[${requestId}] Missing required fields`);
      return createResponse(400, { success: false, error: 'Missing orderDetails or customerPhone' });
    }
    
    const requiredFields = ['orderId', 'customerName', 'items', 'total', 'address'];
    const missingFields = requiredFields.filter(field => !orderDetails[field]);
    if (missingFields.length > 0) {
      console.error(`[${requestId}] Missing order fields:`, missingFields);
      return createResponse(400, { success: false, error: `Missing order fields: ${missingFields.join(', ')}` });
    }
    
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;
    const twilioSms = process.env.TWILIO_SMS_NUMBER;
    const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP_NUMBER;
    const ordersTable = process.env.ORDERS_TABLE;
    
    console.log(`[${requestId}] Environment check:`, {
      hasTwilioSid: !!twilioAccountSid,
      hasTwilioToken: !!twilioAuthToken,
      twilioWhatsApp,
      twilioSms,
      restaurantWhatsApp,
      ordersTable
    });
    
    // Format customer phone number
    let formattedCustomerPhone = customerPhone;
    if (!customerPhone.startsWith('+')) {
      formattedCustomerPhone = '+91' + customerPhone.replace(/^91/, '');
    }
    console.log(`[${requestId}] Phone formatting: ${customerPhone} -> ${formattedCustomerPhone}`);
    
    // Format restaurant message with proper line breaks
    const restaurantMessage = `🔔 NEW ORDER!

Order ID: ${orderDetails.orderId}
Customer: ${orderDetails.customerName}
Phone: ${formattedCustomerPhone}
Items: ${orderDetails.items}
Total: ₹${orderDetails.total}
Address: ${orderDetails.address}

Please prepare this order!`;
    
    // Format customer message
    const customerMessage = `Thank you for your order! Order ID: ${orderDetails.orderId}. Total: ₹${orderDetails.total}. We'll deliver in 30 minutes. - Shiv Tirth Wada`;
    
    console.log(`[${requestId}] Messages prepared. Starting notifications...`);
    
    const results = [];
    
    // Send WhatsApp to restaurant
    try {
      console.log(`[${requestId}] Sending WhatsApp to restaurant: ${restaurantWhatsApp}`);
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
      console.log(`[${requestId}] ✅ Restaurant WhatsApp sent successfully`);
    } catch (error) {
      console.error(`[${requestId}] ❌ Restaurant WhatsApp failed:`, error.message);
      results.push({ type: 'restaurant_whatsapp', success: false, error: error.message });
    }
    
    // Send SMS to customer
    try {
      console.log(`[${requestId}] Sending SMS to customer: ${formattedCustomerPhone}`);
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
      console.log(`[${requestId}] ✅ Customer SMS sent successfully`);
    } catch (error) {
      console.error(`[${requestId}] ❌ Customer SMS failed:`, error.message);
      results.push({ type: 'customer_sms', success: false, error: error.message });
    }
    
    // Save order to DynamoDB if table is configured
    if (ordersTable) {
      try {
        console.log(`[${requestId}] Saving order to DynamoDB table: ${ordersTable}`);
        
        // Parse items if it's a string
        let itemsArray = orderDetails.itemsArray || [];
        if (typeof orderDetails.items === 'string' && orderDetails.items.includes(',')) {
          // Parse "1x Item - ₹100, 2x Item2 - ₹200" format
          itemsArray = orderDetails.items.split(',').map(item => {
            const match = item.trim().match(/(\d+)x\s+(.+?)\s+-\s+₹(\d+)/);
            if (match) {
              return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                total: parseInt(match[3])
              };
            }
            return { name: item.trim(), quantity: 1, total: 0 };
          });
        }
        
        const orderItem = {
          orderId: orderDetails.orderId,
          customerPhone: formattedCustomerPhone,
          customerName: orderDetails.customerName,
          deliveryAddress: orderDetails.address,
          items: itemsArray,
          totalAmount: orderDetails.total,
          status: 'Pending',
          orderTime: new Date().toISOString(),
          estimatedDelivery: '30 minutes'
        };
        
        await dynamodb.put({
          TableName: ordersTable,
          Item: orderItem
        }).promise();
        
        console.log(`[${requestId}] ✅ Order saved to DynamoDB`);
        results.push({ type: 'order_saved', success: true });
      } catch (error) {
        console.error(`[${requestId}] ❌ Failed to save order to DynamoDB:`, error.message);
        results.push({ type: 'order_saved', success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalTime = Date.now() - startTime;
    
    console.log(`[${requestId}] === REQUEST COMPLETE ===`);
    console.log(`[${requestId}] Results:`, JSON.stringify(results, null, 2));
    console.log(`[${requestId}] Success rate: ${successCount}/${results.length}`);
    console.log(`[${requestId}] Total time: ${totalTime}ms`);
    
    if (successCount > 0) {
      return createResponse(200, { 
        success: true, 
        message: `${successCount}/${results.length} operations completed`,
        results,
        processingTime: totalTime
      });
    } else {
      return createResponse(500, { 
        success: false, 
        error: 'All operations failed',
        results,
        processingTime: totalTime
      });
    }
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ FATAL ERROR:`, error);
    console.error(`[${requestId}] Stack trace:`, error.stack);
    console.log(`[${requestId}] === REQUEST FAILED === (${totalTime}ms)`);
    
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
    console.log(`[${requestId}] ${messageType} - Starting Twilio request`);
    console.log(`[${requestId}] ${messageType} - From: ${from}, To: ${to}`);
    
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const postData = new URLSearchParams({
      From: from,
      To: to,
      Body: body
    }).toString();
    
    console.log(`[${requestId}] ${messageType} - Post data length: ${postData.length}`);
    
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
      console.log(`[${requestId}] ${messageType} - Twilio response status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`[${requestId}] ${messageType} - Twilio response:`, data);
        
        try {
          const responseData = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log(`[${requestId}] ${messageType} - ✅ Success, Message SID: ${responseData.sid}`);
            resolve(responseData);
          } else {
            console.error(`[${requestId}] ${messageType} - ❌ Twilio API error:`, responseData);
            reject(new Error(`Twilio API error (${res.statusCode}): ${responseData.message || data}`));
          }
        } catch (parseError) {
          console.error(`[${requestId}] ${messageType} - ❌ Response parse error:`, parseError.message);
          reject(new Error(`Invalid Twilio response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[${requestId}] ${messageType} - ❌ Request error:`, error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`[${requestId}] ${messageType} - ❌ Request timeout`);
      req.destroy();
      reject(new Error('Twilio request timeout'));
    });
    
    req.setTimeout(25000);
    req.write(postData);
    req.end();
  });
}
