# Test All APIs
Write-Host "🧪 Testing All Food Ordering APIs..." -ForegroundColor Cyan

$apiUrl = "https://api.aicodestreams.com"

# Test 1: Get all orders
Write-Host "`n1. Testing GET /orders..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/orders" -Method GET
    Write-Host "✅ Orders API working - Found $($response.Count) orders" -ForegroundColor Green
} catch {
    Write-Host "❌ Orders API failed: $_" -ForegroundColor Red
}

# Test 2: Update order status
Write-Host "`n2. Testing PATCH /orders/{orderId}/status..." -ForegroundColor Yellow
try {
    $testOrderId = "TEST123"
    $body = '{"status":"Preparing"}'
    $response = Invoke-RestMethod -Uri "$apiUrl/orders/$testOrderId/status" -Method PATCH -Body $body -ContentType "application/json"
    Write-Host "✅ Order status update working" -ForegroundColor Green
} catch {
    Write-Host "❌ Order status update failed: $_" -ForegroundColor Red
}

# Test 3: Visitor stats - today
Write-Host "`n3. Testing GET /stats/visitors/today..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/stats/visitors/today" -Method GET
    Write-Host "✅ Today's visitor stats working - $($response.unique_visitors) visitors, $($response.page_views) views" -ForegroundColor Green
} catch {
    Write-Host "❌ Today's visitor stats failed: $_" -ForegroundColor Red
}

# Test 4: Visitor stats - total
Write-Host "`n4. Testing GET /stats/visitors/total..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/stats/visitors/total" -Method GET
    Write-Host "✅ Total visitor stats working - $($response.total_unique_visitors) total visitors" -ForegroundColor Green
} catch {
    Write-Host "❌ Total visitor stats failed: $_" -ForegroundColor Red
}

# Test 5: Track visit
Write-Host "`n5. Testing POST /track-visit..." -ForegroundColor Yellow
try {
    $body = '{"visitorId":"test-visitor-123","pageUrl":"/test"}'
    $response = Invoke-RestMethod -Uri "$apiUrl/track-visit" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Track visit working" -ForegroundColor Green
} catch {
    Write-Host "❌ Track visit failed: $_" -ForegroundColor Red
}

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "Check which APIs are failing and we'll fix them." -ForegroundColor White
