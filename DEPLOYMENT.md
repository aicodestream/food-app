# Deployment Guide - Serverless with Vercel & Twilio

## Quick Setup (5 minutes)

### Step 1: Get Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Go to Console Dashboard
3. Copy your **Account SID** and **Auth Token**
4. Go to **Messaging > Try it out > Send a WhatsApp message**
5. Follow instructions to join the WhatsApp Sandbox
6. Note your Twilio WhatsApp number (e.g., `whatsapp:+14155238886`)

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd food-ordering-website
vercel
```

### Step 3: Add Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings > Environment Variables
3. Add these variables:

```
TWILIO_ACCOUNT_SID = your_account_sid
TWILIO_AUTH_TOKEN = your_auth_token  
TWILIO_WHATSAPP_NUMBER = whatsapp:+14155238886
```

4. Redeploy: `vercel --prod`

### Step 4: Test

1. Visit your Vercel URL (e.g., `your-app.vercel.app`)
2. Place an order
3. Check WhatsApp for confirmation!

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Twilio credentials to .env

# Start Vercel dev server
vercel dev

# In another terminal, update js/script.js with your local URL
# Then open http://localhost:3000
```

## Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

Add environment variables in Netlify Dashboard > Site settings > Environment variables

## Cost

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Twilio WhatsApp**: 
  - Sandbox: FREE for testing
  - Production: ~$0.005 per message
  - 1000 orders/month = $5

## Troubleshooting

**WhatsApp not received?**
1. Check you joined Twilio Sandbox (send join code)
2. Verify phone number format: `whatsapp:+1234567890`
3. Check Vercel logs: `vercel logs`

**API Error?**
1. Verify environment variables are set
2. Check Twilio credentials are correct
3. View function logs in Vercel Dashboard

## Production Checklist

- [ ] Get Twilio WhatsApp Business API (not sandbox)
- [ ] Add custom domain to Vercel
- [ ] Enable analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Add rate limiting
- [ ] Create WhatsApp message templates
