# Deploy Admin Authentication
Write-Host "🚀 Deploying Admin Authentication..." -ForegroundColor Cyan

$stackName = "food-ordering-admin-auth"
$region = "us-east-1"
$profile = "app"

# Step 1: Setup admin password in Secrets Manager
Write-Host "`n📝 Step 1: Setting up admin password..." -ForegroundColor Yellow
./setup-admin-password.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup admin password. Exiting..." -ForegroundColor Red
    exit 1
}

# Step 2: Deploy CloudFormation stack
Write-Host "`n📦 Step 2: Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file cloudformation/admin-auth-stack.yaml `
    --stack-name $stackName `
    --capabilities CAPABILITY_NAMED_IAM `
    --profile $profile `
    --region $region

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ CloudFormation deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ CloudFormation stack deployed" -ForegroundColor Green

# Step 3: Deploy Lambda code
Write-Host "`n📤 Step 3: Deploying Lambda function code..." -ForegroundColor Yellow

Set-Location lambda

# Copy admin-login.js to index.js
Copy-Item admin-login.js index.js

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path index.js,package.json,node_modules -DestinationPath function.zip -Force

# Upload to Lambda
Write-Host "Uploading to Lambda..." -ForegroundColor Yellow
$zipPath = (Get-Item function.zip).FullName
aws lambda update-function-code `
    --function-name food-ordering-admin-login `
    --zip-file "fileb://$zipPath" `
    --profile $profile `
    --region $region

Set-Location ..

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Admin authentication deployed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Admin Login Endpoint:" -ForegroundColor Cyan
    Write-Host "   POST https://api.aicodestreams.com/admin-login" -ForegroundColor White
    Write-Host "`n🔐 You can now login at:" -ForegroundColor Cyan
    Write-Host "   https://app.aicodestreams.com/admin-login.html" -ForegroundColor White
} else {
    Write-Host "`n❌ Lambda deployment failed" -ForegroundColor Red
    exit 1
}
