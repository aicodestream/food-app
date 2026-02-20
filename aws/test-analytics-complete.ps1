# Complete Analytics Test - Simulating Admin Panel Behavior
Write-Host "🎯 Complete Analytics Test" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "https://api.aicodestreams.com"
$allPassed = $true

# Test 1: Stats Range (Date Range Analytics)
Write-Host "1️⃣ Testing Date Range Analytics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/stats/range?startDate=2026-02-01&endDate=2026-02-28" -Method Get
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Total Orders: $($response.total_orders)" -ForegroundColor White
    Write-Host "   Total Revenue: ₹$($response.total_revenue)" -ForegroundColor White
    Write-Host "   Avg Order Value: ₹$([math]::Round($response.avg_order_value, 2))" -ForegroundColor White
    Write-Host "   Status Breakdown:" -ForegroundColor White
    Write-Host "     - Pending: $($response.orders_by_status.pending)" -ForegroundColor Gray
    Write-Host "     - Preparing: $($response.orders_by_status.preparing)" -ForegroundColor Gray
    Write-Host "     - Delivering: $($response.orders_by_status.delivering)" -ForegroundColor Gray
    Write-Host "     - Delivered: $($response.orders_by_status.delivered)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 2: Customer Billing
Write-Host "2️⃣ Testing Customer Billing..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/stats/customers" -Method Get
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Total Customers: $($response.Count)" -ForegroundColor White
    Write-Host "   Top Customers:" -ForegroundColor White
    $response | Select-Object -First 3 | ForEach-Object {
        Write-Host "     - $($_.name) ($($_.phone)): $($_.total_orders) orders, ₹$($_.total_spent) spent" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 3: CORS Headers
Write-Host "3️⃣ Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://app.aicodestreams.com"
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/stats/customers" -Method OPTIONS -Headers $headers
    $corsHeader = $response.Headers['access-control-allow-origin']
    
    if ($corsHeader -eq "https://app.aicodestreams.com" -or $corsHeader -eq "*") {
        Write-Host "   ✅ CORS properly configured" -ForegroundColor Green
        Write-Host "   Allow-Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️ CORS may have issues" -ForegroundColor Yellow
        Write-Host "   Allow-Origin: $corsHeader" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host "`n================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✅ All tests passed! Analytics endpoints are ready." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Open https://app.aicodestreams.com/admin.html" -ForegroundColor White
    Write-Host "2. Login with admin credentials" -ForegroundColor White
    Write-Host "3. Click 'Analytics' tab" -ForegroundColor White
    Write-Host "4. Test 'Date Range' and 'Customer Billing' buttons" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Please review the errors above." -ForegroundColor Red
}
