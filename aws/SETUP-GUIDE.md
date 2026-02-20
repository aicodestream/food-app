# Complete Setup Guide - Dual WhatsApp Notifications

This system sends WhatsApp messages to **TWO numbers**:
1. **Customer** - Gets order confirmation
2. **Restaurant/Business** - Gets new order notification

## 📱 WhatsApp Numbers Needed

### 1. Twilio WhatsApp Number (Sender)
- This is the number that SENDS messages
- Get from Twilio Sandbox: `whatsapp:+14155238886`
- Format: `whatsapp:+14155238886`

### 2. Restaurant WhatsApp Number (Receiver)
- This is YOUR business number that receives order notifications
- Your personal/business WhatsApp number
- Format: `whatsapp:+919876543210` (with country code)

### 3. Customer WhatsApp Number
- Automatically taken from order form
- Customer enters their number when placing order

## 🔧 Setup Steps

### Step 1: Join Twilio WhatsApp Sandbox

1. Go to: https://console.twilio.com/
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see: "Send `join <code>` to `whatsapp:+14155238886`"
4. **On YOUR phone** (restaurant owner):
   - Open WhatsApp
   - Send the join code to the Twilio number
   - Wait for confirmation
5. **Ask your test customer** to do the same (for testing)

### Step 2: Get Credentials

From Twilio Console Dashboard:
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: Click "Show" to reveal
- **Twilio WhatsApp Number**: `whatsapp:+14155238886`
- **Your Restaurant Number**: `whatsapp:+91XXXXXXXXXX`

### Step 3: Test Locally

```bash
cd food-ordering-website/aws

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
RESTAURANT_WHATSAPP_NUMBER=whatsapp:+919876543210
```

Test:
```bash
cd lambda
npm install
cd ..
node local-test.js
```

### Step 4: Deploy to AWS

```bash
./deploy.sh
```

Enter when prompted:
1. Twilio Account SID
2. Twilio Auth Token
3. Twilio WhatsApp Number
4. Restaurant WhatsApp Number

## 📨 What Happens When Order is Placed?

### Customer Receives:
```
🍔 QuickBite Order Confirmation

Order ID: ORD15748218
Customer: John Doe

📦 Items:
2x Burger - $25.98
1x Fries - $5.99

💰 Total: $31.97

📍 Delivery Address: 123 Main St

⏰ Estimated Delivery: 30 minutes

Thank you for your order! 🎉
```

### Restaurant Receives:
```
🔔 NEW ORDER RECEIVED!

Order ID: ORD15748218
Time: 2/19/2026, 8:30 PM

👤 Customer Details:
Name: John Doe
Phone: +919766007557
Address: 123 Main St

📦 Order Items:
2x Burger - $25.98
1x Fries - $5.99

💰 Total Amount: $31.97

⏰ Delivery Time: 30 minutes

Please prepare this order!
```

## 🧪 Testing Checklist

- [ ] Both numbers joined Twilio Sandbox
- [ ] Local test sends to both numbers
- [ ] Customer gets confirmation message
- [ ] Restaurant gets order notification
- [ ] Messages show correct order details
- [ ] Phone numbers in correct format

## ⚠️ Common Issues

**"Not a valid WhatsApp number"**
- Number must join Twilio Sandbox first
- Format must be: `whatsapp:+[country code][number]`

**"Only customer gets message"**
- Check RESTAURANT_WHATSAPP_NUMBER in .env
- Verify restaurant number joined sandbox

**"No messages received"**
- Check Twilio logs: https://console.twilio.com/monitor/logs/messages
- Verify both numbers are in sandbox

## 💰 Cost

**Sandbox (Testing):**
- FREE for both messages
- Limited to sandbox participants only

**Production (WhatsApp Business API):**
- ~$0.005 per message
- 1000 orders = 2000 messages = $10/month
- No sandbox restrictions

## 🚀 Going to Production

1. Apply for WhatsApp Business API
2. Get approved business number
3. Update TWILIO_WHATSAPP_NUMBER
4. Remove sandbox restrictions
5. Customers don't need to join sandbox

## 📞 Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- WhatsApp Business API: https://www.twilio.com/whatsapp
