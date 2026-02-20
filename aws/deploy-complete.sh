#!/bin/bash

# Complete deployment script for Food Ordering Website
# This deploys Lambda, API Gateway, and RDS using CloudFormation

set -e

echo "🚀 Starting deployment..."

# Configuration
STACK_NAME="food-ordering-complete"
AWS_PROFILE="app"
AWS_REGION="us-east-1"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_WHATSAPP="whatsapp:+14155238886"
TWILIO_SMS="your_twilio_sms_number"
RESTAURANT_WHATSAPP="whatsapp:+919766007557"
RESTAURANT_SMS="+919766007557"

# Database Password (change this!)
DB_PASSWORD="FoodOrder123!"

echo "📦 Step 1: Package Lambda function..."
cd lambda
npm install --production
zip -r ../function.zip . -x "*.git*" "node_modules/aws-sdk/*"
cd ..

echo "☁️  Step 2: Deploy CloudFormation stack..."
aws cloudformation deploy \
  --template-file cloudformation/complete-stack.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    TwilioAccountSid=$TWILIO_ACCOUNT_SID \
    TwilioAuthToken=$TWILIO_AUTH_TOKEN \
    TwilioWhatsAppNumber=$TWILIO_WHATSAPP \
    TwilioSmsNumber=$TWILIO_SMS \
    RestaurantWhatsAppNumber=$RESTAURANT_WHATSAPP \
    RestaurantSmsNumber=$RESTAURANT_SMS \
    DBPassword=$DB_PASSWORD \
  --profile $AWS_PROFILE \
  --region $AWS_REGION

echo "📤 Step 3: Update Lambda function code..."
FUNCTION_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionArn`].OutputValue' \
  --output text \
  --profile $AWS_PROFILE \
  --region $AWS_REGION | cut -d':' -f7)

aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://function.zip \
  --profile $AWS_PROFILE \
  --region $AWS_REGION

echo "✅ Step 4: Get outputs..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --profile $AWS_PROFILE \
  --region $AWS_REGION)

DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text \
  --profile $AWS_PROFILE \
  --region $AWS_REGION)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Outputs:"
echo "  API URL: $API_URL"
echo "  Database Endpoint: $DB_ENDPOINT"
echo ""
echo "📝 Next steps:"
echo "  1. Update js/script.js with API URL: $API_URL"
echo "  2. Initialize database schema on RDS"
echo "  3. Deploy frontend with: amplify publish"
echo ""
echo "🧪 Test API:"
echo "  curl -X POST $API_URL \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"orderId\":\"TEST\",\"customerName\":\"Test\",\"customerPhone\":\"1234567890\",\"deliveryAddress\":\"Test\",\"items\":[],\"totalAmount\":100,\"estimatedDelivery\":\"30min\"}'"
