# Complete API Deployment Script for Windows
# Deploys all Lambda functions and API routes in one stack

$ErrorActionPreference = "Stop"

$STACK_NAME = "food-ordering-complete-api"
$TEMPLATE_FILE = "cloudformation/complete-api-stack.yaml"
$PARAMS_FILE = "complete-api-params.json"
$REGION = "us-east-1"
$PROFILE = "app"

Write-Host "🚀 Deploying Complete Food Ordering API Stack" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Stack Name: $STACK_NAME"
Write-Host "Region: $REGION"
Write-Host "Profile: $PROFILE"
Write-Host ""

# Check if parameters file exists
if (-not (Test-Path $PARAMS_FILE)) {
    Write-Host "❌ Error: Parameters file not found: $PARAMS_FILE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create $PARAMS_FILE with your Twilio credentials."
    Write-Host "See complete-api-params.example.json for template."
    exit 1
}

# Check if stack exists
try {
    aws cloudformation describe-stacks --stack-name $STACK_NAME --profile $PROFILE --region $REGION 2>$null | Out-Null
    Write-Host "⚠️  Stack exists. Updating..." -ForegroundColor Yellow
    $ACTION = "update-stack"
} catch {
    Write-Host "✨ Creating new stack..." -ForegroundColor Green
    $ACTION = "create-stack"
}

# Deploy stack
Write-Host "📦 Deploying CloudFormation stack..." -ForegroundColor Cyan
aws cloudformation $ACTION `
    --stack-name $STACK_NAME `
    --template-body file://$TEMPLATE_FILE `
    --parameters file://$PARAMS_FILE `
    --capabilities CAPABILITY_NAMED_IAM `
    --profile $PROFILE `
    --region $REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for stack to complete..." -ForegroundColor Yellow

if ($ACTION -eq "create-stack") {
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --profile $PROFILE --region $REGION
} else {
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --profile $PROFILE --region $REGION
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Stack operation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Checking stack events for errors..." -ForegroundColor Yellow
    aws cloudformation describe-stack-events --stack-name $STACK_NAME --profile $PROFILE --region $REGION --max-items 10 --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' --output table
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Stack Outputs:" -ForegroundColor Cyan
aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --profile $PROFILE `
    --region $REGION `
    --query 'Stacks[0].Outputs' `
    --output table

Write-Host ""
Write-Host "🎉 All API routes deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Available Endpoints:" -ForegroundColor Cyan
Write-Host "  POST   /send-notification" -ForegroundColor White
Write-Host "  POST   /track-visit" -ForegroundColor White
Write-Host "  GET    /orders" -ForegroundColor White
Write-Host "  GET    /orders/customer/{phone}" -ForegroundColor White
Write-Host "  PATCH  /orders/{orderId}/status" -ForegroundColor White
Write-Host "  GET    /stats/daily/{date}" -ForegroundColor White
Write-Host "  GET    /stats/visitors/today" -ForegroundColor White
Write-Host "  GET    /stats/visitors/total" -ForegroundColor White
Write-Host "  POST   /auth/send-otp (already deployed)" -ForegroundColor Gray
Write-Host "  POST   /auth/verify-otp (already deployed)" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 API URL: https://api.aicodestreams.com" -ForegroundColor Cyan
