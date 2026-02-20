# Shiv Tirth Wada - Food Ordering Website

A complete food ordering website with WhatsApp and SMS notifications, built with vanilla JavaScript and deployed on AWS.

## 🚀 Live Demo

- **Website**: https://app.aicodestreams.com
- **API**: https://api.aicodestreams.com

## ✨ Features

- **Multi-language Support**: English and Marathi
- **OTP Authentication**: Secure login with phone number
- **Real-time Notifications**: WhatsApp to restaurant, SMS to customers
- **Admin Dashboard**: Order management and analytics
- **Mobile Responsive**: Optimized for all devices
- **Visitor Tracking**: Analytics and insights
- **Order Management**: Complete order lifecycle

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: AWS Lambda (Node.js)
- **Database**: MySQL (for local development)
- **Notifications**: Twilio (WhatsApp & SMS)
- **Hosting**: AWS Amplify
- **API**: AWS API Gateway

## 📱 Pages

- **Home**: Menu browsing and cart management
- **Login**: OTP-based authentication
- **My Orders**: Customer order history
- **Admin**: Order management and analytics

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- AWS CLI configured with 'app' profile
- Twilio account with WhatsApp and SMS enabled

### 1. Clone Repository

```bash
git clone https://github.com/aicodestream/food-app.git
cd food-app
```

### 2. Configure Environment

```bash
# Copy environment template
cp aws/.env.example aws/.env

# Edit aws/.env with your Twilio credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_NUMBER=your_phone_number
```

### 3. Deploy Backend

```bash
# Make script executable
chmod +x aws/deploy-backend.sh

# Deploy to AWS
./aws/deploy-backend.sh
```

### 4. Deploy Frontend

The frontend auto-deploys via AWS Amplify when you push to the main branch.

## 🧪 Testing

### Test API Directly

```bash
curl -X POST https://api.aicodestreams.com/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderDetails": {
      "orderId": "TEST123",
      "customerName": "Test User",
      "items": "1x Chicken Thali - ₹400",
      "total": 400,
      "address": "Test Address, Miraj"
    },
    "customerPhone": "+919766007557"
  }'
```

### View Logs

```bash
aws logs tail /aws/lambda/food-ordering-notifications --follow --profile app --region us-east-1
```

## 📊 Architecture

```
Frontend (Amplify) → API Gateway → Lambda → Twilio
                                      ↓
                                   CloudWatch Logs
```

## 🔐 Security Features

- Environment variables for sensitive data
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Error handling and logging
- Phone number normalization

## 📝 API Documentation

### Send Notification

**Endpoint**: `POST /send-notification`

**Request Body**:
```json
{
  "orderDetails": {
    "orderId": "string",
    "customerName": "string", 
    "items": "string",
    "total": number,
    "address": "string"
  },
  "customerPhone": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "2/2 notifications sent",
  "results": [...],
  "processingTime": 674
}
```

## 🚀 Deployment

### Frontend (AWS Amplify)
- Auto-deploys from GitHub main branch
- Custom domain: app.aicodestreams.com
- SSL certificate included

### Backend (AWS Lambda)
- Serverless architecture
- API Gateway integration
- CloudWatch logging
- Custom domain: api.aicodestreams.com

## 🔧 Configuration

### Restaurant Settings
- WhatsApp: +919766007557
- SMS: +919766007557
- Twilio Sandbox: +14155238886

### Notification Flow
1. Customer places order
2. WhatsApp sent to restaurant
3. SMS confirmation sent to customer
4. Order saved to localStorage
5. Admin can manage via dashboard

## 📱 Mobile Features

- Touch-friendly interface
- Hamburger menu navigation
- Responsive design
- iOS input zoom fix
- Optimized loading

## 🌐 Internationalization

- English and Marathi support
- Dynamic language switching
- Localized menu items
- Currency formatting (₹)

## 🔍 Monitoring

- CloudWatch logs for debugging
- Error tracking and reporting
- Performance metrics
- Visitor analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the logs: `aws logs tail /aws/lambda/food-ordering-notifications --follow`
- Review API documentation
- Test with provided curl commands

## 🎯 Future Enhancements

- Payment gateway integration
- Real-time order tracking
- Push notifications
- Inventory management
- Multi-restaurant support