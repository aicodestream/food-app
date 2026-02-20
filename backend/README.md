# Food Ordering Backend - n8n + Twilio Integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Backend Server (Optional)

```bash
npm start
```

Server runs on http://localhost:3000

### 3. Setup Twilio for WhatsApp

#### Get Twilio Account

1. Sign up at [Twilio](https://www.twilio.com/)
2. Go to Console Dashboard
3. Get your Account SID and Auth Token
4. Enable WhatsApp in Twilio Console

#### Twilio WhatsApp Sandbox (For Testing)

1. Go to Messaging > Try it out > Send a WhatsApp message
2. Follow instructions to join sandbox (send code to Twilio number)
3. Note your Twilio WhatsApp number (format: whatsapp:+14155238886)

### 4. Setup n8n

```bash
npm install -g n8n
n8n start
```

Visit http://localhost:5678

### 5. Configure n8n Workflow

1. Import `n8n-workflow.json` into n8n
2. Add Twilio credentials:
   - Account SID
   - Auth Token
3. Update Twilio node:
   - From: Your Twilio WhatsApp number (e.g., whatsapp:+14155238886)
4. Activate workflow
5. Copy webhook URL

### 6. Update Frontend

Edit `js/script.js`:
```javascript
const N8N_WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';
```

## Testing Without Backend

The frontend works standalone using in-memory data. Just open `index.html` in a browser.

## WhatsApp Message Format

```
🍔 QuickBite Order Confirmation

Order ID: ORD12345678
Customer: John Doe

Items:
2x Classic Burger - $25.98
1x Coca Cola - $2.99

Total: $28.97
Delivery Address: 123 Main St

Estimated Delivery: 30 minutes

Thank you for your order! 🎉
```

## API Endpoints (Backend)

- `GET /api/menu` - Get menu items
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status

## Admin Panel

Open `admin.html` to view and manage orders.

Features:
- View all orders
- Update order status (Pending → Preparing → Delivering → Completed)
- Real-time statistics

## Alternative: WhatsApp Business API

For production, use official WhatsApp Business API:
1. Create Meta Business Account
2. Set up WhatsApp Business API
3. Replace Twilio node with WhatsApp node in n8n

## Troubleshooting

- If webhook fails, check n8n is running
- Verify Twilio credentials are correct
- Ensure phone numbers include country code (e.g., +1234567890)
- For WhatsApp, numbers must be in format: whatsapp:+1234567890
