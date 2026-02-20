# Deploy Visitor Analytics GET Route
$ErrorActionPreference = "Stop"

Write-Host "Deploying Visitor Analytics GET Route..." -ForegroundColor Cyan

# Variables
$REGION = "us-east-1"
$PROFILE = "app"
$STACK_NAME = "visitor-analytics-route"
$TEMPLATE_FILE = "cloudformation/visitor-analytics-route.yaml"

# Get API Gateway ID
Write-Host "Getting API Gateway ID..." -ForegroundColor Yellow
$API_ID = "ewbzhkjb20"

if ([string]::IsNullOrEmpty($API_ID)) {
    Write-Host "Could not find API Gateway" -ForegroundColor Red
    exit 1
}

Write-Host "Found API Gateway: $API_ID" -ForegroundColor Green

# Deploy CloudFormation stack
Write-Host "Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file $TEMPLATE_FILE `
    --stack-name $STACK_NAME `
    --parameter-overrides ApiId=$API_ID `
    --capabilities CAPABILITY_IAM `
    --region $REGION `
    --profile $PROFILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "Visitor Analytics GET route deployed successfully!" -ForegroundColor Green
    Write-Host "Endpoint: https://api.aicodestreams.com/visitor-tracking" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed" -ForegroundColor Red
    exit 1
}
