const https = require('https');

// In-memory OTP storage (for production, use DynamoDB)
const otpStore = new Map();

exports.handler = async (event) => {
  const requestId = event.requestContext?.requestId || 'unknown';
  console.log(`[${requestId}] Request:`, JSON.stringify(event, null, 2));
  
  const path = event.rawPath || event.path;
  const method = event.requestContext?.http?.method || event.httpMethod;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return createResponse(200, { message: 'OK' });
  }
  
  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }
    
    // Route handling
    if (path === '/auth/send-otp' && method === 'POST') {
      return await handleSendOTP(requestId, body);
    } else if (path === '/auth/verify-otp' && method === 'POST') {
      return await handleVerifyOTP(requestId, body);
    } else {
      return createResponse(404, { success: false, error: 'Endpoint not found' });
    }
    
  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return createResponse(500, { success: false, error: error.message });
  }
};

async function handleSendOTP(requestId, body) {
  const { phone } = body;
  
  if (!phone) {
    return createResponse(400, { success: false, error: 'Phone number is required' });
  }
  
  // Format phone number
  let formattedPhone = phone;
  if (!phone.startsWith('+')) {
    formattedPhone = '+91' + phone.replace(/^91/, '');
  }
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(formattedPhone, { otp, expiresAt, attempts: 0 });
  
  console.log(`[${requestId}] Generated OTP for ${formattedPhone}: ${otp}`);
  
  // Send OTP via SMS
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSms = process.env.TWILIO_SMS_NUMBER;
    
    const message = `Your Shiv Tirth Wada login OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    await sendTwilioSMS(
      requestId,
      twilioAccountSid,
      twilioAuthToken,
      twilioSms,
      formattedPhone,
      message
    );
    
    console.log(`[${requestId}] OTP sent successfully to ${formattedPhone}`);
    
    return createResponse(200, {
      success: true,
      message: 'OTP sent successfully',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error(`[${requestId}] Failed to send OTP:`, error);
    return createResponse(500, {
      success: false,
      error: 'Failed to send OTP. Please try again.'
    });
  }
}

async function handleVerifyOTP(requestId, body) {
  const { phone, otp } = body;
  
  if (!phone || !otp) {
    return createResponse(400, {
      success: false,
      error: 'Phone number and OTP are required'
    });
  }
  
  // Format phone number
  let formattedPhone = phone;
  if (!phone.startsWith('+')) {
    formattedPhone = '+91' + phone.replace(/^91/, '');
  }
  
  // Check if OTP exists
  const storedData = otpStore.get(formattedPhone);
  
  if (!storedData) {
    return createResponse(400, {
      success: false,
      message: 'OTP not found or expired. Please request a new OTP.'
    });
  }
  
  // Check if OTP expired
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(formattedPhone);
    return createResponse(400, {
      success: false,
      message: 'OTP has expired. Please request a new OTP.'
    });
  }
  
  // Check attempts
  if (storedData.attempts >= 3) {
    otpStore.delete(formattedPhone);
    return createResponse(400, {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.'
    });
  }
  
  // Verify OTP
  if (storedData.otp !== otp) {
    storedData.attempts++;
    otpStore.set(formattedPhone, storedData);
    
    return createResponse(400, {
      success: false,
      message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
    });
  }
  
  // OTP verified successfully
  otpStore.delete(formattedPhone);
  
  console.log(`[${requestId}] OTP verified successfully for ${formattedPhone}`);
  
  // Create user session
  const user = {
    phone: formattedPhone,
    name: '', // Will be updated later
    role: 'customer',
    loginTime: new Date().toISOString()
  };
  
  return createResponse(200, {
    success: true,
    message: 'Login successful',
    user: user
  });
}

function sendTwilioSMS(requestId, accountSid, authToken, from, to, body) {
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          const responseData = JSON.parse(data);
          console.log(`[${requestId}] SMS sent, SID: ${responseData.sid}`);
          resolve(responseData);
        } else {
          console.error(`[${requestId}] Twilio error:`, data);
          reject(new Error(`Twilio API error: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`[${requestId}] Request error:`, error);
      reject(error);
    });
    
    req.setTimeout(25000);
    req.write(postData);
    req.end();
  });
}

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
