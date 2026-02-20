# Deploy All Lambda Functions
# This script packages and deploys all Lambda functions with AWS SDK v3

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying All Lambda Functions" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Change to lambda directory
Set-Location lambda

# List of Lambda functions to deploy
$lambdas = @(
    @{Name="food-ordering-notifications"; File="notifications-v3.js"},
    @{Name="food-ordering-orders-api"; File="orders-api.js"},
    @{Name="food-ordering-visitor-tracking"; File="visitor-tracking.js"},
    @{Name="food-ordering-stats-api"; File="stats-api.js"}
)

foreach ($lambda in $lambdas) {
    $functionName = $lambda.Name
    $sourceFile = $lambda.File
    
    Write-Host "📦 Packaging $functionName..." -ForegroundColor Yellow
    
    # Create temp directory for this lambda
    $tempDir = "temp-$functionName"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # Copy files
    Copy-Item $sourceFile "$tempDir/index.js"
    Copy-Item package.json $tempDir/
    Copy-Item -Recurse node_modules $tempDir/
    
    # Create zip
    $zipFile = "$functionName.zip"
    Compress-Archive -Path "$tempDir/*" -DestinationPath $zipFile -Force
    
    # Clean up temp directory
    Remove-Item -Recurse -Force $tempDir
    
    Write-Host "📤 Uploading $functionName..." -ForegroundColor Yellow
    
    # Upload to Lambda
    aws lambda update-function-code `
        --function-name $functionName `
        --zip-file "fileb://$zipFile" `
        --profile app `
        --region us-east-1 `
        --query '[FunctionName,LastModified]' `
        --output table
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $functionName deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy $functionName" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🎉 All Lambda functions deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "Testing endpoints..." -ForegroundColor Cyan

# Test notification endpoint
Write-Host "Testing /send-notification..." -ForegroundColor Yellow
$testPayload = @{
    orderDetails = @{
        orderId = "TEST999"
        customerName = "Test User"
        items = "1x Test Item - ₹50"
        itemsArray = @(
            @{
                name = "Test Item"
                quantity = 1
                total = 50
            }
        )
        total = 50
        address = "Test Address"
    }
    customerPhone = "8668909382"
} | ConvertTo-Json -Depth 10

$testPayload | Out-File -FilePath test-order.json -Encoding utf8NoBOM

try {
    $response = Invoke-RestMethod -Uri "https://api.aicodestreams.com/send-notification" `
        -Method Post `
        -ContentType "application/json" `
        -Body $testPayload
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    Remove-Item test-order.json -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
