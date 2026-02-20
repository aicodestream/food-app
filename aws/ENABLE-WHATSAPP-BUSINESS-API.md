# How to Enable WhatsApp Business API on Twilio

## Why Can't It Be Enabled Automatically?

WhatsApp Business API requires:
- Business verification by Meta (Facebook)
- Manual review of your business
- Approval process (1-3 weeks)
- Business documents and website

This CANNOT be done programmatically - you must apply manually.

## Step-by-Step Guide to Enable

### Step 1: Login to Twilio Console

1. Go to: https://console.twilio.com/
2. Login with your credentials
3. Make sure you're on the correct account (your_account_sid)

### Step 2: Navigate to WhatsApp Senders

1. Click on **Messaging** in the left sidebar
2. Click on **Try it out** → **Send a WhatsApp message**
3. OR go directly to: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders

### Step 3: Request WhatsApp Business API Access

Look for one of these options:
- "Request Access to WhatsApp"
- "Enable WhatsApp Business API"
- "Submit for WhatsApp Approval"

Click the button to start the application.

### Step 4: Fill Out the Application Form

You'll need to provide:

**Business Information:**
- Business Name: `Shiv Tirth Wada` (शिवतीर्थ वडा)
- Business Type: Restaurant / Food Service
- Business Address: Your restaurant address
- Business Phone: +918668909382
- Business Email: Your email

**Business Website:**
- Website URL: Your restaurant website
- If you don't have one, you can use:
  - Facebook page
  - Instagram profile
  - Google Business listing

**Use Case:**
- Purpose: Order notifications and customer communication
- Description: "Send order confirmations and delivery updates to customers who place food orders through our website"
- Expected Volume: Estimate monthly messages (e.g., 500-1000/month)

**Facebook Business Manager:**
- You'll need a Facebook Business Manager account
- Create one at: https://business.facebook.com/
- Link it to your Twilio account

**Documents Required:**
- Business registration certificate (if available)
- GST certificate (if applicable)
- Business proof (utility bill, bank statement)

### Step 5: Submit and Wait for Approval

- Review all information
- Submit the application
- Wait for Meta/Twilio to review (1-3 weeks typically)
- You'll receive email updates on status

### Step 6: After Approval

Once approved, you'll get:
- Your own WhatsApp Business number
- Ability to send to ANY customer (no sandbox)
- Message templates for notifications
- Higher sending limits

Then update your `.env` file:
```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX  # Your approved number
```

## Alternative: Use SMS (Already Working!)

**Good News**: I've already implemented SMS for customers!

**Current Setup:**
- ✅ Customers receive SMS (works immediately, no approval needed)
- ✅ Restaurant receives WhatsApp (only restaurant needs sandbox)
- ✅ No waiting for approval
- ✅ Works for ANY customer phone number

**Cost Comparison:**
- SMS: ~₹0.60 per message
- WhatsApp Business API: ~₹0.40 per message
- Difference: Only ₹200/month for 1000 orders

**Recommendation**: Use SMS for now, apply for WhatsApp Business API in parallel.

## Quick Links

1. **Twilio Console**: https://console.twilio.com/
2. **WhatsApp Senders**: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
3. **Facebook Business Manager**: https://business.facebook.com/
4. **Twilio Support**: https://support.twilio.com/

## What to Do Right Now

### Option A: Apply for WhatsApp Business API (Takes 1-3 weeks)
1. Follow steps above
2. Submit application
3. Wait for approval
4. Meanwhile, use SMS

### Option B: Use SMS (Works immediately - RECOMMENDED)
1. Already implemented in your code ✅
2. Start the server: `node local-server.js`
3. Test by placing an order
4. Customer gets SMS, restaurant gets WhatsApp
5. No approval needed!

## Test Current SMS Implementation

```bash
cd food-ordering-website/aws
node local-server.js
```

Then place an order:
- Customer (7028104413) will receive SMS ✅
- Restaurant (+918668909382) will receive WhatsApp ✅

## Need Help?

If you want to apply for WhatsApp Business API:
1. Open Twilio console
2. Look for "WhatsApp" section
3. Click "Request Access" or "Enable"
4. Fill out the form
5. Submit for review

**I cannot do this for you** - it requires your business information and manual verification.

---

**My Recommendation**: Start with SMS (already working), apply for WhatsApp Business API in the background. You'll be operational immediately while waiting for approval.
