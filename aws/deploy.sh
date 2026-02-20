#!/bin/bash

# Deployment script for AWS Lambda with CloudFormation
# Uses 'app' profile

set -e

echo "🚀 Deploying Food Ordering WhatsApp Service to AWS"
echo "=================================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Installing..."
    echo "Run: pip install aws-sam-cli"
    exit 1
fi

# Set AWS profile
export AWS_PROFILE=app
echo "✅ Using AWS Profile: $AWS_PROFILE"

# Get Twilio credentials
echo ""
read -p "Enter Twilio Account SID: " TWILIO_SID
read -sp "Enter Twilio Auth Token: " TWILIO_TOKEN
echo ""
read -p "Enter Twilio WhatsApp Number (e.g., whatsapp:+14155238886): " TWILIO_NUMBER
read -p "Enter Restaurant WhatsApp Number (e.g., whatsapp:+919876543210): " RESTAURANT_NUMBER

# Install dependencies
echo ""
echo "📦 Installing Lambda dependencies..."
cd lambda
npm install --production
cd ..

# Build SAM application
echo ""
echo "🔨 Building SAM application..."
sam build --template-file cloudformation/template.yaml

# Deploy with CloudFormation
echo ""
echo "☁️  Deploying to AWS..."
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name food-ordering-whatsapp \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    TwilioAccountSid="$TWILIO_SID" \
    TwilioAuthToken="$TWILIO_TOKEN" \
    TwilioWhatsAppNumber="$TWILIO_NUMBER" \
    RestaurantWhatsAppNumber="$RESTAURANT_NUMBER" \
  --profile app \
  --no-confirm-changeset

# Get API endpoint
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name food-ordering-whatsapp \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile app)

echo ""
echo "=================================================="
echo "🎉 SUCCESS!"
echo "=================================================="
echo ""
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Next steps:"
echo "1. Update js/script.js with this endpoint"
echo "2. Test the API with: curl -X POST $API_ENDPOINT -d '{...}'"
echo "3. Deploy your frontend to S3 or any hosting"
echo ""
