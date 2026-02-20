#!/bin/bash

# Deploy Complete Backend using CloudFormation
# This creates both notification and OTP authentication Lambda functions

set -e

PROFILE="app"
REGION="us-east-1"
STACK_NAME="food-ordering-backend"

echo "🚀 Deploying Complete Backend with CloudFormation..."

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ]; then
    echo "❌ Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env file"
    exit 1
fi

# Create deployment packages
echo "📦 Creating Lambda deployment packages..."

# Package notification Lambda
cd lambda
zip -q ../notification-deployment.zip enhanced-lambda.js 2>/dev/null || echo "Using existing notification code"
cd ..

# Package OTP auth Lambda
cd lambda
zip -q ../otp-auth-deployment.zip auth-otp.js 2>/dev/null || echo "Using existing OTP auth code"
cd ..

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --profile $PROFILE --region $REGION 2>/dev/null; then
    echo "♻️  Updating existing stack..."
    ACTION="update-stack"
else
    echo "✨ Creating new stack..."
    ACTION="create-stack"
fi

# Deploy CloudFormation stack
aws cloudformation $ACTION \
    --stack-name $STACK_NAME \
    --template-body file://cloudformation/complete-backend.yaml \
    --parameters \
        ParameterKey=TwilioAccountSid,ParameterValue=$TWILIO_ACCOUNT_SID \
        ParameterKey=TwilioAuthToken,ParameterValue=$TWILIO_AUTH_TOKEN \
        ParameterKey=TwilioWhatsAppNumber,ParameterValue="whatsapp:+14155238886" \
        ParameterKey=TwilioSmsNumber,ParameterValue="+18287981553" \
        ParameterKey=RestaurantWhatsAppNumber,ParameterValue="whatsapp:+919766007557" \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile $PROFILE \
    --region $REGION

echo "⏳ Waiting for stack to complete..."
aws cloudformation wait stack-${ACTION//-stack/}-complete \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION

echo "📤 Updating Lambda function code..."

# Update notification Lambda code
aws lambda update-function-code \
    --function-name food-ordering-notifications \
    --zip-file fileb://notification-deployment.zip \
    --profile $PROFILE \
    --region $REGION

# Update OTP auth Lambda code
aws lambda update-function-code \
    --function-name food-ordering-otp-auth \
    --zip-file fileb://otp-auth-deployment.zip \
    --profile $PROFILE \
    --region $REGION

# Clean up
rm -f notification-deployment.zip otp-auth-deployment.zip

# Get outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "📋 API Endpoints:"
echo "  Notifications: POST ${API_ENDPOINT}/send-notification"
echo "  Send OTP: POST ${API_ENDPOINT}/auth/send-otp"
echo "  Verify OTP: POST ${API_ENDPOINT}/auth/verify-otp"
echo ""
echo "🧪 Test OTP:"
echo "curl -X POST ${API_ENDPOINT}/auth/send-otp -H 'Content-Type: application/json' -d '{\"phone\":\"8668909382\"}'"
