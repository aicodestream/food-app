// Vercel Serverless Function for WhatsApp Notifications
const twilio = require('twilio');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, customerName, customerPhone, deliveryAddress, items, totalAmount, estimatedDelivery } = req.body;

    // Validate required fields
    if (!customerPhone || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const client = twilio(accountSid, authToken);

    // Format items list
    const itemsList = items.map(item => 
      `${item.quantity}x ${item.name} - $${item.total.toFixed(2)}`
    ).join('\n');

    // Create WhatsApp message
    const message = `🍔 *QuickBite Order Confirmation*

Order ID: ${orderId}
Customer: ${customerName}

📦 *Items:*
${itemsList}

💰 *Total: $${totalAmount.toFixed(2)}*

📍 Delivery Address: ${deliveryAddress}

⏰ Estimated Delivery: ${estimatedDelivery}

Thank you for your order! 🎉`;

    // Send WhatsApp message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${customerPhone}`
    });

    console.log('WhatsApp sent:', twilioMessage.sid);

    return res.status(200).json({
      success: true,
      messageSid: twilioMessage.sid,
      orderId: orderId
    });

  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return res.status(500).json({
      error: 'Failed to send WhatsApp notification',
      details: error.message
    });
  }
}
