# Quick Order Status Update Script
# Use this to manually update order statuses until CORS is fully fixed

param(
    [Parameter(Mandatory=$true)]
    [string]$OrderId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled")]
    [string]$Status
)

Write-Host "🔄 Updating order $OrderId to status: $Status" -ForegroundColor Cyan

$body = @{
    status = $Status
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.aicodestreams.com/orders/$OrderId/status" `
        -Method PATCH `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Order status updated successfully!" -ForegroundColor Green
    
    # Verify the update
    Write-Host "`n📋 Verifying update in DynamoDB..." -ForegroundColor Yellow
    $dbStatus = aws dynamodb get-item `
        --table-name food-ordering-orders `
        --key "{`"orderId`":{`"S`":`"$OrderId`"}}" `
        --profile app --region us-east-1 `
        --query 'Item.status.S' `
        --output text
    
    Write-Host "Current status in database: $dbStatus" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to update order status: $_" -ForegroundColor Red
}

Write-Host "`n💡 Usage examples:" -ForegroundColor Yellow
Write-Host "  .\update-order-status.ps1 -OrderId ORD06020608 -Status 'Preparing'"
Write-Host "  .\update-order-status.ps1 -OrderId ORD06020608 -Status 'Out for Delivery'"
Write-Host "  .\update-order-status.ps1 -OrderId ORD06020608 -Status 'Delivered'"
