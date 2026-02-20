# AWS Lambda Deployment Guide

Deploy the food ordering WhatsApp notification service to AWS using Lambda, API Gateway, and CloudFormation.

## Prerequisites

1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed
3. **Node.js** 20.x or later
4. **Twilio Account** with WhatsApp enabled

## Setup AWS Profile

```bash
# Configure AWS CLI with 'app' profile
aws configure --profile app

# Enter your credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

## Local Testing

### 1. Install Dependencies

```bash
cd aws/lambda
npm install
cd ..
```

### 2. Create .env File

```bash
cp .env.example .env
# Edit .env and add your Twilio credentials
```

### 3. Run Local Test

```bash
node local-test.js
```

This will:
- Load your Twilio credentials from .env
- Send a test WhatsApp message
- Show the response

## Deploy to AWS

### Option 1: Using Deploy Script (Recommended)

```bash
cd aws
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Check prerequisites
2. Ask for Twilio credentials
3. Install dependencies
4. Build the SAM application
5. Deploy to AWS
6. Show you the API endpoint

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
cd lambda
npm install --production
cd ..

# 2. Build
sam build --template-file cloudformation/template.yaml

# 3. Deploy
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name food-ordering-whatsapp \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    TwilioAccountSid=YOUR_SID \
    TwilioAuthToken=YOUR_TOKEN \
    TwilioWhatsAppNumber=whatsapp:+14155238886 \
  --profile app \
  --guided

# 4. Get endpoint
aws cloudformation describe-stacks \
  --stack-name food-ordering-whatsapp \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile app
```

## Update Frontend

After deployment, update `js/script.js`:

```javascript
const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/send-whatsapp';
```

## Test the API

```bash
curl -X POST https://YOUR_API_ENDPOINT/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "customerName": "Test User",
    "customerPhone": "+919766007557",
    "deliveryAddress": "123 Test St",
    "items": [{"name": "Burger", "quantity": 1, "price": 10, "total": 10}],
    "totalAmount": 10,
    "estimatedDelivery": "30 minutes"
  }'
```

## View Logs

```bash
# View Lambda logs
sam logs --stack-name food-ordering-whatsapp --profile app --tail

# Or use CloudWatch
aws logs tail /aws/lambda/food-ordering-send-whatsapp --follow --profile app
```

## Update Deployment

```bash
# Make changes to lambda/send-whatsapp.js
# Then redeploy
cd aws
./deploy.sh
```

## Delete Stack

```bash
aws cloudformation delete-stack \
  --stack-name food-ordering-whatsapp \
  --profile app
```

## Cost Estimate

- **Lambda**: Free tier (1M requests/month)
- **API Gateway**: Free tier (1M requests/month)
- **CloudWatch Logs**: ~$0.50/GB
- **Twilio WhatsApp**: ~$0.005/message

**Total for 1000 orders/month: ~$5-10**

## Troubleshooting

**Lambda timeout?**
- Increase timeout in template.yaml (currently 30s)

**CORS errors?**
- Check API Gateway CORS settings in template.yaml

**Twilio errors?**
- Verify credentials in AWS Systems Manager Parameter Store
- Check phone number format: `whatsapp:+1234567890`

**Deployment fails?**
- Check AWS credentials: `aws sts get-caller-identity --profile app`
- Verify SAM CLI: `sam --version`

## Architecture

```
Frontend (S3/CloudFront)
    ↓
API Gateway
    ↓
Lambda Function
    ↓
Twilio API
    ↓
WhatsApp
```

## Security

- Twilio credentials stored as CloudFormation parameters (encrypted)
- Lambda has minimal IAM permissions
- API Gateway has CORS enabled
- CloudWatch logs for monitoring
