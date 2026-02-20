#!/bin/bash

# Complete API Deployment Script
# Deploys all Lambda functions and API routes in one stack

set -e

STACK_NAME="food-ordering-complete-api"
TEMPLATE_FILE="cloudformation/complete-api-stack.yaml"
PARAMS_FILE="complete-api-params.json"
REGION="us-east-1"
PROFILE="app"

echo "🚀 Deploying Complete Food Ordering API Stack"
echo "=============================================="
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "Profile: $PROFILE"
echo ""

# Check if parameters file exists
if [ ! -f "$PARAMS_FILE" ]; then
    echo "❌ Error: Parameters file not found: $PARAMS_FILE"
    echo ""
    echo "Please create $PARAMS_FILE with your Twilio credentials."
    echo "See complete-api-params.example.json for template."
    exit 1
fi

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --profile $PROFILE --region $REGION &> /dev/null; then
    echo "⚠️  Stack exists. Updating..."
    ACTION="update-stack"
else
    echo "✨ Creating new stack..."
    ACTION="create-stack"
fi

# Deploy stack
echo "📦 Deploying CloudFormation stack..."
aws cloudformation $ACTION \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --parameters file://$PARAMS_FILE \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile $PROFILE \
    --region $REGION

echo ""
echo "⏳ Waiting for stack to complete..."
aws cloudformation wait stack-${ACTION//-stack/}-complete \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --profile $PROFILE \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "🎉 All API routes deployed successfully!"
echo ""
echo "Available Endpoints:"
echo "  POST   /send-notification"
echo "  POST   /track-visit"
echo "  GET    /orders"
echo "  GET    /orders/customer/{phone}"
echo "  PATCH  /orders/{orderId}/status"
echo "  GET    /stats/daily/{date}"
echo "  GET    /stats/visitors/today"
echo "  GET    /stats/visitors/total"
echo "  POST   /auth/send-otp (already deployed)"
echo "  POST   /auth/verify-otp (already deployed)"
echo ""
echo "🌐 API URL: https://api.aicodestreams.com"
