# Complete Deployment Guide

## Overview

This food ordering website can be deployed using:
1. **AWS Amplify** - Frontend hosting
2. **AWS Lambda + API Gateway** - Serverless backend
3. **RDS MySQL** - Database
4. **CloudFormation** - Infrastructure as Code

## Architecture

```
Frontend (Amplify) → API Gateway → Lambda → RDS MySQL
                                  ↓
                              Twilio SMS/WhatsApp
```

## Prerequisites

- AWS CLI installed and configured
- AWS Amplify CLI installed
- Node.js 18+ installed
- MySQL database (RDS or local)
- Twilio account with credentials

## Part 1: Deploy Backend (Lambda + API Gateway)

### Step 1: Update CloudFormation Template

The CloudFormation template is already created at `aws/cloudformation/template.yaml`

### Step 2: Package Lambda Function

```bash
cd food-ordering-website/aws/lambda
npm install
cd ..
```

### Step 3: Deploy with CloudFormation

```bash
# Set your AWS profile
export AWS_PROFILE=app

# Deploy the stack
aws cloudformation deploy \
  --template-file cloudformation/template.yaml \
  --stack-name food-ordering-backend \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    TwilioAccountSid=your_twilio_account_sid \
    TwilioAuthToken=your_twilio_auth_token \
    TwilioWhatsAppNumber=whatsapp:+14155238886 \
    TwilioSmsNumber=your_twilio_sms_number \
    RestaurantWhatsAppNumber=whatsapp:+919766007557 \
    RestaurantSmsNumber=+919766007557 \
  --profile app
```

### Step 4: Get API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name food-ordering-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --profile app
```

## Part 2: Setup Database (RDS MySQL)

### Option A: Use Existing RDS

Update connection details in Lambda environment variables.

### Option B: Create New RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier food-ordering-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --profile app
```

### Initialize Database

```bash
# Connect to RDS
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p

# Run schema
source database/schema.sql
source database/add-auth-tables.sql
source database/add-visitor-tracking.sql
source database/add-otp-auth.sql
```

## Part 3: Deploy Frontend (AWS Amplify)

### Step 1: Initialize Amplify

```bash
cd food-ordering-website

# Install Amplify CLI if not installed
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init
```

Answer prompts:
- Project name: `food-ordering-website`
- Environment: `prod`
- Default editor: Your choice
- App type: `javascript`
- Framework: `none`
- Source directory: `.`
- Distribution directory: `.`
- Build command: `npm run build` (or leave empty)
- Start command: `npm start` (or leave empty)
- AWS Profile: `app`

### Step 2: Add Hosting

```bash
amplify add hosting
```

Choose:
- Hosting with Amplify Console
- Manual deployment

### Step 3: Update API Endpoint

Update `js/script.js` with your API Gateway URL:

```javascript
const API_ENDPOINT = 'https://your-api-id.execute-api.region.amazonaws.com/prod/send-whatsapp';
```

### Step 4: Deploy

```bash
amplify publish
```

## Part 4: Environment Variables

Create `.env` file for Lambda:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_SMS_NUMBER=your_twilio_sms_number
RESTAURANT_WHATSAPP_NUMBER=whatsapp:+919766007557
RESTAURANT_SMS_NUMBER=+919766007557

# Database (if using RDS)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=food_ordering
```

## Part 5: CLI Commands Reference

### Deploy Everything

```bash
# 1. Deploy backend
cd food-ordering-website/aws
./deploy.sh

# 2. Deploy frontend
cd ..
amplify publish
```

### Update Lambda Function Only

```bash
cd food-ordering-website/aws/lambda
zip -r function.zip .
aws lambda update-function-code \
  --function-name food-ordering-whatsapp \
  --zip-file fileb://function.zip \
  --profile app
```

### Update CloudFormation Stack

```bash
aws cloudformation update-stack \
  --stack-name food-ordering-backend \
  --template-body file://cloudformation/template.yaml \
  --capabilities CAPABILITY_IAM \
  --profile app
```

### Delete Stack

```bash
aws cloudformation delete-stack \
  --stack-name food-ordering-backend \
  --profile app
```

## Part 6: Mobile Responsiveness

The app is already mobile responsive with:
- ✅ Responsive grid layouts
- ✅ Hamburger menu for mobile
- ✅ Touch-friendly buttons (44px minimum)
- ✅ Viewport meta tag
- ✅ Flexible images
- ✅ Mobile-first CSS

Test on mobile:
```bash
# Start local server
cd food-ordering-website/aws
node local-server.js

# Access from mobile via tunnel
cloudflared tunnel --url http://localhost:3001
```

## Part 7: Post-Deployment

### 1. Test API

```bash
curl -X POST https://your-api-url/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "customerName": "Test User",
    "customerPhone": "7028104413",
    "deliveryAddress": "Test Address",
    "items": [{"name": "Test Item", "quantity": 1, "total": 100}],
    "totalAmount": 100,
    "estimatedDelivery": "30 minutes"
  }'
```

### 2. Configure Custom Domain (Optional)

```bash
amplify add custom-domain
```

### 3. Enable HTTPS

Amplify automatically provides HTTPS.

## Monitoring

### CloudWatch Logs

```bash
aws logs tail /aws/lambda/food-ordering-whatsapp --follow --profile app
```

### API Gateway Metrics

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=food-ordering-api \
  --start-time 2026-02-20T00:00:00Z \
  --end-time 2026-02-20T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --profile app
```

## Costs Estimate

- **Amplify Hosting**: ~$0.15/GB served
- **Lambda**: Free tier 1M requests/month
- **API Gateway**: $3.50 per million requests
- **RDS t3.micro**: ~$15/month
- **Twilio SMS**: ~$0.0079 per SMS
- **Total**: ~$20-30/month for small traffic

## Troubleshooting

### Lambda Timeout
Increase timeout in CloudFormation template (default: 30s)

### CORS Issues
Check API Gateway CORS configuration in template

### Database Connection
Ensure Lambda has VPC access to RDS

### Twilio Errors
Check credentials and phone number formats

## Support

For issues, check:
- CloudWatch Logs
- API Gateway execution logs
- Twilio message logs
- RDS connection logs
