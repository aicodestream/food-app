# Test Notification API

Write-Host "🧪 Testing Notification API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$testData = @"
{
  "orderDetails": {
    "orderId": "TEST001",
    "customerName": "Test User",
    "items": "1x Test Item - Rs100",
    "total": 100,
    "address": "Test Address, Pune"
  },
  "customerPhone": "8668909382"
}
"@

Write-Host "📤 Sending test order notification..." -ForegroundColor Yellow
Write-Host "Endpoint: https://api.aicodestreams.com/send-notification"
Write-Host ""

$response = curl.exe -s -X POST https://api.aicodestreams.com/send-notification `
    -H "Content-Type: application/json" `
    -d $testData

Write-Host "📨 Response:" -ForegroundColor Cyan
Write-Host $response
Write-Host ""

$result = $response | ConvertFrom-Json

if ($result.success) {
    Write-Host "✅ Test PASSED - Notifications sent successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Test FAILED - Check the response above" -ForegroundColor Red
}
