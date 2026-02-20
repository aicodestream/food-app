// AWS Lambda Function for WhatsApp + SMS Notifications via Twilio
const twilio = require('twilio');

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { orderId, customerName, customerPhone, deliveryAddress, items, totalAmount, estimatedDelivery } = body;

    // Validate required fields
    if (!customerPhone || !orderId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const twilioSmsNumber = process.env.TWILIO_SMS_NUMBER;
    const restaurantWhatsAppNumber = process.env.RESTAURANT_WHATSAPP_NUMBER;
    const restaurantSmsNumber = process.env.RESTAURANT_SMS_NUMBER;

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Format items list
    const itemsList = items.map(item => 
      `${item.quantity}x ${item.name} - ₹${item.total}`
    ).join('\n');

    // SMS Message for CUSTOMER (shorter, no markdown)
    const customerSmsMessage = `Shiv Tirth Wada - Order Confirmed!

Order: ${orderId}
Items: ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
Total: Rs.${totalAmount}
Delivery: ${estimatedDelivery}

Address: ${deliveryAddress}

Thank you for your order!`;

    // Message for RESTAURANT/BUSINESS
    const restaurantMessage = `🔔 *NEW ORDER RECEIVED!*

Order ID: ${orderId}
Time: ${new Date().toLocaleString()}

👤 *Customer Details:*
Name: ${customerName}
Phone: ${customerPhone}
Address: ${deliveryAddress}

📦 *Order Items:*
${itemsList}

💰 *Total Amount: ₹${totalAmount}*

⏰ Delivery Time: ${estimatedDelivery}

Please prepare this order!`;

    // Message for RESTAURANT/BUSINESS (SMS format - shorter)
    const restaurantSmsMessage = `🔔 NEW ORDER: ${orderId}

Customer: ${customerName}
Phone: ${customerPhone}
Address: ${deliveryAddress}

Items:
${itemsList}

Total: ₹${totalAmount}
Delivery: ${estimatedDelivery}

Shiv Tirth Wada Orders`;

    // Send notifications: SMS to CUSTOMER (no opt-in needed), WhatsApp to RESTAURANT
    const notifications = [];
    let customerMessageSid = null;

    // Send SMS to CUSTOMER (works immediately, no opt-in required!)
    const customerSmsNumber = customerPhone.startsWith('+') 
      ? customerPhone 
      : '+91' + customerPhone;
    
    if (twilioSmsNumber) {
      try {
        const customerSmsSent = await client.messages.create({
          body: customerSmsMessage,
          from: twilioSmsNumber,
          to: customerSmsNumber
        });
        console.log('Customer SMS sent:', customerSmsSent.sid);
        customerMessageSid = customerSmsSent.sid;
      } catch (error) {
        console.log('Customer SMS failed:', error.message);
      }
    }

    // Send WhatsApp to RESTAURANT using sandbox
    if (restaurantWhatsAppNumber) {
      try {
        // Use Twilio sandbox number as sender
        const sandboxNumber = 'whatsapp:+14155238886';
        
        // Send full formatted message
        const restaurantWhatsAppSent = await client.messages.create({
          from: sandboxNumber,
          to: restaurantWhatsAppNumber,
          body: restaurantMessage
        });
        console.log('Restaurant WhatsApp sent:', restaurantWhatsAppSent.sid);
        notifications.push({ type: 'whatsapp', sid: restaurantWhatsAppSent.sid });
      } catch (error) {
        console.log('Restaurant WhatsApp failed:', error.message);
        console.log('Error details:', error);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        customerMessageSid: customerMessageSid,
        customerNotificationType: 'sms',
        restaurantNotifications: notifications,
        orderId: orderId,
        note: 'SMS sent to customer (no opt-in required). WhatsApp requires customer opt-in.'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to send WhatsApp notification',
        details: error.message
      })
    };
  }
};
