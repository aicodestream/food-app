#!/bin/bash

# Deploy OTP Authentication Lambda Function
# This script creates/updates the Lambda function and API Gateway routes

set -e

PROFILE="app"
REGION="us-east-1"
FUNCTION_NAME="food-ordering-otp-auth"
API_ID="ewbzhkjb20"

echo "🚀 Deploying OTP Authentication Lambda..."

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd lambda
zip -r ../otp-auth-deployment.zip auth-otp.js
cd ..

# Check if Lambda function exists
if aws lambda get-function --function-name $FUNCTION_NAME --profile $PROFILE --region $REGION 2>/dev/null; then
    echo "♻️  Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://otp-auth-deployment.zip \
        --profile $PROFILE \
        --region $REGION
    
    # Update environment variables
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN,TWILIO_SMS_NUMBER=$TWILIO_SMS_NUMBER,NODE_ENV=production}" \
        --profile $PROFILE \
        --region $REGION
else
    echo "✨ Creating new Lambda function..."
    
    # Get Lambda execution role ARN
    ROLE_ARN=$(aws iam get-role --role-name lambda-execution-role --profile $PROFILE --query 'Role.Arn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "❌ Lambda execution role not found. Creating..."
        # Create role if it doesn't exist
        aws iam create-role \
            --role-name lambda-execution-role \
            --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
            --profile $PROFILE
        
        aws iam attach-role-policy \
            --role-name lambda-execution-role \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
            --profile $PROFILE
        
        ROLE_ARN=$(aws iam get-role --role-name lambda-execution-role --profile $PROFILE --query 'Role.Arn' --output text)
        
        echo "⏳ Waiting for role to be ready..."
        sleep 10
    fi
    
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler auth-otp.handler \
        --zip-file fileb://otp-auth-deployment.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN,TWILIO_SMS_NUMBER=$TWILIO_SMS_NUMBER,NODE_ENV=production}" \
        --profile $PROFILE \
        --region $REGION
fi

echo "⏳ Waiting for Lambda to be ready..."
sleep 5

# Get Lambda ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --profile $PROFILE --region $REGION --query 'Configuration.FunctionArn' --output text)
echo "Lambda ARN: $LAMBDA_ARN"

# Create API Gateway integration
echo "🔗 Setting up API Gateway routes..."

# Check if integration exists
INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id $API_ID --profile $PROFILE --region $REGION --query "Items[?contains(IntegrationUri, '$FUNCTION_NAME')].IntegrationId" --output text)

if [ -z "$INTEGRATION_ID" ]; then
    echo "Creating new integration..."
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri $LAMBDA_ARN \
        --payload-format-version 2.0 \
        --profile $PROFILE \
        --region $REGION \
        --query 'IntegrationId' \
        --output text)
fi

echo "Integration ID: $INTEGRATION_ID"

# Create routes
for ROUTE in "POST /auth/send-otp" "POST /auth/verify-otp" "OPTIONS /auth/send-otp" "OPTIONS /auth/verify-otp"; do
    echo "Creating route: $ROUTE"
    
    # Check if route exists
    ROUTE_ID=$(aws apigatewayv2 get-routes --api-id $API_ID --profile $PROFILE --region $REGION --query "Items[?RouteKey=='$ROUTE'].RouteId" --output text)
    
    if [ -z "$ROUTE_ID" ]; then
        aws apigatewayv2 create-route \
            --api-id $API_ID \
            --route-key "$ROUTE" \
            --target "integrations/$INTEGRATION_ID" \
            --profile $PROFILE \
            --region $REGION
    else
        echo "Route already exists: $ROUTE"
    fi
done

# Add Lambda permission for API Gateway
echo "🔐 Adding Lambda permissions..."
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-invoke-otp \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*/auth/*" \
    --profile $PROFILE \
    --region $REGION 2>/dev/null || echo "Permission already exists"

# Clean up
rm otp-auth-deployment.zip

echo "✅ OTP Authentication Lambda deployed successfully!"
echo ""
echo "📋 API Endpoints:"
echo "  Send OTP: POST https://api.aicodestreams.com/auth/send-otp"
echo "  Verify OTP: POST https://api.aicodestreams.com/auth/verify-otp"
echo ""
echo "🧪 Test with:"
echo "curl -X POST https://api.aicodestreams.com/auth/send-otp -H 'Content-Type: application/json' -d '{\"phone\":\"8668909382\"}'"
