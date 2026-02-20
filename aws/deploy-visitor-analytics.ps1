# Deploy Visitor Analytics Lambda Update
$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Visitor Analytics Lambda Update..." -ForegroundColor Cyan

# Variables
$REGION = "us-east-1"
$PROFILE = "app"
$FUNCTION_NAME = "visitor-tracking"
$ZIP_FILE = "visitor-tracking-update.zip"

# Step 1: Package the Lambda function
Write-Host "`n📦 Packaging Lambda function..." -ForegroundColor Yellow
Set-Location aws/lambda
if (Test-Path $ZIP_FILE) {
    Remove-Item $ZIP_FILE
}
Compress-Archive -Path visitor-tracking.js -DestinationPath $ZIP_FILE
Write-Host "✅ Package created: $ZIP_FILE" -ForegroundColor Green

# Step 2: Update Lambda function code
Write-Host "`n🔄 Updating Lambda function code..." -ForegroundColor Yellow
aws lambda update-function-code `
    --function-name $FUNCTION_NAME `
    --zip-file fileb://$ZIP_FILE `
    --region $REGION `
    --profile $PROFILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda function code updated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update Lambda function code" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

# Step 3: Wait for update to complete
Write-Host "`n⏳ Waiting for Lambda update to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Cleanup
Remove-Item $ZIP_FILE
Set-Location ../..

Write-Host "`n✅ Visitor Analytics Lambda updated successfully!" -ForegroundColor Green
Write-Host "`nℹ️  The Lambda now supports:" -ForegroundColor Cyan
Write-Host "  - POST /visitor-tracking (track visitors)" -ForegroundColor White
Write-Host "  - GET /visitor-tracking?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (get analytics)" -ForegroundColor White
