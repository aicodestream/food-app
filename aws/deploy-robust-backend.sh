#!/bin/bash

# Deploy Robust Backend for Food Ordering App
echo "🚀 Deploying Robust Backend..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile app >/dev/null 2>&1; then
    echo "❌ AWS CLI not configured with 'app' profile"
    exit 1
fi

# Set variables
STACK_NAME="food-ordering-robust-backend"
TEMPLATE_FILE="aws/cloudformation/robust-backend.yaml"
REGION="us-east-1"

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Load environment variables
if [ -f "aws/.env" ]; then
    source aws/.env
    echo "✅ Loaded environment variables"
else
    echo "❌ Environment file not found: aws/.env"
    exit 1
fi

# Validate required environment variables
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_SMS_NUMBER" ]; then
    echo "❌ Missing required environment variables"
    echo "Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_NUMBER"
    exit 1
fi

echo "📋 Stack: $STACK_NAME"
echo "📁 Template: $TEMPLATE_FILE"
echo "🌍 Region: $REGION"
echo "📞 SMS Number: $TWILIO_SMS_NUMBER"

# Deploy the stack
echo "🔄 Deploying CloudFormation stack..."

aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        TwilioAccountSid="$TWILIO_ACCOUNT_SID" \
        TwilioAuthToken="$TWILIO_AUTH_TOKEN" \
        TwilioWhatsAppNumber="whatsapp:+14155238886" \
        TwilioSmsNumber="$TWILIO_SMS_NUMBER" \
        RestaurantWhatsAppNumber="whatsapp:+919766007557" \
        RestaurantSmsNumber="+919766007557" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --profile app

if [ $? -eq 0 ]; then
    echo "✅ Stack deployed successfully!"
    
    # Get outputs
    echo "📊 Getting stack outputs..."
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
        --output text \
        --region "$REGION" \
        --profile app)
    
    FUNCTION_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`FunctionName`].OutputValue' \
        --output text \
        --region "$REGION" \
        --profile app)
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "📡 API URL: $API_URL"
    echo "⚡ Function: $FUNCTION_NAME"
    echo ""
    echo "🧪 Test the API:"
    echo "curl -X POST $API_URL/send-notification \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"orderDetails\":{\"orderId\":\"TEST123\",\"customerName\":\"Test\",\"items\":\"Test Item\",\"total\":100,\"address\":\"Test Address\"},\"customerPhone\":\"+919766007557\"}'"
    echo ""
    echo "📋 View logs:"
    echo "aws logs tail /aws/lambda/$FUNCTION_NAME --follow --profile app --region $REGION"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi